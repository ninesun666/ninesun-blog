package com.ninesun.blog.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;

/**
 * 初始化模型配置表
 * 执行 SQL 脚本创建表和插入默认数据
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ModelConfigInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            // 检查 knowledge_bases 表是否已存在
            Integer kbTableExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables " +
                "WHERE table_name = 'knowledge_bases'",
                Integer.class
            );

            if (kbTableExists != null && kbTableExists == 0) {
                // 创建知识库相关表
                createKnowledgeBaseTables();
            }

            // 检查 model_providers 表是否已存在
            Integer tableExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables " +
                "WHERE table_name = 'model_providers'",
                Integer.class
            );

            if (tableExists != null && tableExists > 0) {
                log.info("model_providers 表已存在，跳过创建");
                return;
            }

            // 创建模型配置表
            createModelConfigTables();

            // 插入默认数据
            insertDefaultData();

            log.info("模型配置表初始化完成");

        } catch (Exception e) {
            log.error("初始化模型配置表失败: {}", e.getMessage());
            // 不抛出异常，允许应用继续启动
        }
    }

    private void createKnowledgeBaseTables() {
        try {
            // 创建知识库表
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS knowledge_bases (
                    id BIGSERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    type VARCHAR(20) DEFAULT 'custom',
                    status VARCHAR(20) DEFAULT 'active',
                    config JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """);

            // 创建文档表
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS kb_documents (
                    id BIGSERIAL PRIMARY KEY,
                    kb_id BIGINT REFERENCES knowledge_bases(id) ON DELETE CASCADE,
                    title VARCHAR(255) NOT NULL,
                    source_type VARCHAR(20),
                    source_id BIGINT,
                    file_path VARCHAR(500),
                    file_type VARCHAR(50),
                    file_size BIGINT,
                    content_hash VARCHAR(64),
                    status VARCHAR(20) DEFAULT 'pending',
                    error_message TEXT,
                    chunk_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """);

            // 创建分块表
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS kb_chunks (
                    id BIGSERIAL PRIMARY KEY,
                    document_id BIGINT REFERENCES kb_documents(id) ON DELETE CASCADE,
                    kb_id BIGINT REFERENCES knowledge_bases(id) ON DELETE CASCADE,
                    content TEXT NOT NULL,
                    chunk_index INTEGER,
                    token_count INTEGER,
                    metadata JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """);

            // 创建向量表
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS kb_embeddings (
                    id BIGSERIAL PRIMARY KEY,
                    chunk_id BIGINT REFERENCES kb_chunks(id) ON DELETE CASCADE,
                    kb_id BIGINT REFERENCES knowledge_bases(id) ON DELETE CASCADE,
                    content_hash VARCHAR(64),
                    embedding vector(1536),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """);

            // 创建 HNSW 索引
            jdbcTemplate.execute("""
                CREATE INDEX IF NOT EXISTS idx_kb_embeddings_hnsw ON kb_embeddings 
                USING hnsw (embedding vector_cosine_ops)
                """);

            jdbcTemplate.execute("""
                CREATE INDEX IF NOT EXISTS idx_kb_embeddings_kb_id ON kb_embeddings(kb_id)
                """);

            log.info("知识库表创建成功");
        } catch (Exception e) {
            log.error("创建知识库表失败: {}", e.getMessage());
        }
    }

    private void createModelConfigTables() {
        // 创建模型提供商表
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS model_providers (
                id BIGSERIAL PRIMARY KEY,
                provider VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                enabled BOOLEAN DEFAULT false,
                priority INTEGER DEFAULT 0,
                config JSONB NOT NULL DEFAULT '{}',
                models JSONB NOT NULL DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """);

        // 创建模型配置表
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS model_configs (
                id BIGSERIAL PRIMARY KEY,
                provider_id BIGINT REFERENCES model_providers(id) ON DELETE CASCADE,
                model_name VARCHAR(100) NOT NULL,
                display_name VARCHAR(100) NOT NULL,
                type VARCHAR(20) NOT NULL DEFAULT 'chat',
                enabled BOOLEAN DEFAULT true,
                is_default BOOLEAN DEFAULT false,
                parameters JSONB NOT NULL DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(provider_id, model_name, type)
            )
            """);

        // 创建索引
        jdbcTemplate.execute("""
            CREATE INDEX IF NOT EXISTS idx_model_providers_enabled ON model_providers(enabled)
            """);

        jdbcTemplate.execute("""
            CREATE INDEX IF NOT EXISTS idx_model_configs_provider ON model_configs(provider_id)
            """);

        jdbcTemplate.execute("""
            CREATE INDEX IF NOT EXISTS idx_model_configs_type ON model_configs(type)
            """);

        jdbcTemplate.execute("""
            CREATE INDEX IF NOT EXISTS idx_model_configs_enabled ON model_configs(enabled)
            """);

        log.info("模型配置表创建成功");
    }

    private void insertDefaultData() {
        // 插入 OpenAI 提供商
        jdbcTemplate.execute("""
            INSERT INTO model_providers (provider, name, description, enabled, priority, config, models)
            VALUES (
                'openai',
                'OpenAI',
                'OpenAI API 服务',
                true,
                1,
                '{"base_url": "https://api.openai.com/v1", "api_key": ""}'::jsonb,
                '[
                    {"name": "gpt-4o", "display_name": "GPT-4o", "max_tokens": 8192},
                    {"name": "gpt-4o-mini", "display_name": "GPT-4o Mini", "max_tokens": 8192},
                    {"name": "text-embedding-3-small", "display_name": "Embedding Small", "dimensions": 1536}
                ]'::jsonb
            )
            ON CONFLICT (provider) DO NOTHING
            """);

        // 插入 Azure 提供商
        jdbcTemplate.execute("""
            INSERT INTO model_providers (provider, name, description, enabled, priority, config, models)
            VALUES (
                'azure',
                'Azure OpenAI',
                'Azure OpenAI 服务',
                false,
                2,
                '{"endpoint": "", "api_key": "", "api_version": "2024-02-01"}'::jsonb,
                '[]'::jsonb
            )
            ON CONFLICT (provider) DO NOTHING
            """);

        // 插入 Anthropic 提供商
        jdbcTemplate.execute("""
            INSERT INTO model_providers (provider, name, description, enabled, priority, config, models)
            VALUES (
                'anthropic',
                'Anthropic',
                'Claude 模型',
                false,
                3,
                '{"base_url": "https://api.anthropic.com", "api_key": ""}'::jsonb,
                '[
                    {"name": "claude-3-opus-20240229", "display_name": "Claude 3 Opus", "max_tokens": 4096},
                    {"name": "claude-3-sonnet-20240229", "display_name": "Claude 3 Sonnet", "max_tokens": 4096}
                ]'::jsonb
            )
            ON CONFLICT (provider) DO NOTHING
            """);

        // 插入 Gemini 提供商
        jdbcTemplate.execute("""
            INSERT INTO model_providers (provider, name, description, enabled, priority, config, models)
            VALUES (
                'gemini',
                'Google Gemini',
                'Google Gemini API',
                false,
                4,
                '{"api_key": ""}'::jsonb,
                '[
                    {"name": "gemini-pro", "display_name": "Gemini Pro", "max_tokens": 8192}
                ]'::jsonb
            )
            ON CONFLICT (provider) DO NOTHING
            """);

        // 插入 Ollama 提供商
        jdbcTemplate.execute("""
            INSERT INTO model_providers (provider, name, description, enabled, priority, config, models)
            VALUES (
                'ollama',
                'Ollama',
                '本地 Ollama 服务',
                false,
                5,
                '{"base_url": "http://localhost:11434"}'::jsonb,
                '[
                    {"name": "llama2", "display_name": "Llama 2", "max_tokens": 4096},
                    {"name": "mistral", "display_name": "Mistral", "max_tokens": 4096}
                ]'::jsonb
            )
            ON CONFLICT (provider) DO NOTHING
            """);

        // 插入 SiliconFlow 提供商
        jdbcTemplate.execute("""
            INSERT INTO model_providers (provider, name, description, enabled, priority, config, models)
            VALUES (
                'siliconflow',
                'SiliconFlow',
                '硅基流动 API',
                false,
                6,
                '{"base_url": "https://api.siliconflow.cn/v1", "api_key": ""}'::jsonb,
                '[
                    {"name": "deepseek-ai/DeepSeek-V2.5", "display_name": "DeepSeek V2.5", "max_tokens": 8192}
                ]'::jsonb
            )
            ON CONFLICT (provider) DO NOTHING
            """);

        // 插入默认模型配置
        jdbcTemplate.execute("""
            INSERT INTO model_configs (provider_id, model_name, display_name, type, enabled, is_default, parameters)
            SELECT 
                p.id,
                'gpt-4o-mini',
                'GPT-4o Mini',
                'chat',
                true,
                true,
                '{"temperature": 0.7, "max_tokens": 2000, "top_p": 1.0}'::jsonb
            FROM model_providers p
            WHERE p.provider = 'openai'
            ON CONFLICT DO NOTHING
            """);

        jdbcTemplate.execute("""
            INSERT INTO model_configs (provider_id, model_name, display_name, type, enabled, is_default, parameters)
            SELECT 
                p.id,
                'text-embedding-3-small',
                'Embedding Small',
                'embedding',
                true,
                true,
                '{}'::jsonb
            FROM model_providers p
            WHERE p.provider = 'openai'
            ON CONFLICT DO NOTHING
            """);

        log.info("模型配置默认数据插入完成");
    }
}
