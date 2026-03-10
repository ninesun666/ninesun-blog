package com.ninesun.blog.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 初始化 pgvector 相关表
 * Hibernate ddl-auto 无法正确处理 vector 类型，需要手动创建表
 * 使用 IF NOT EXISTS 确保幂等性，不会丢失已有数据
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VectorTableInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            // 确保 pgvector 扩展已启用
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS vector");
            log.info("pgvector 扩展已启用");

            // 检查表是否存在
            Integer tableExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables " +
                "WHERE table_name = 'article_embeddings'",
                Integer.class
            );

            if (tableExists != null && tableExists > 0) {
                log.info("article_embeddings 表已存在，跳过创建");
                return;
            }

            // 创建表（使用 IF NOT EXISTS 作为双重保险）
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS article_embeddings (
                    id BIGSERIAL PRIMARY KEY,
                    article_id BIGINT UNIQUE NOT NULL,
                    content_hash VARCHAR(64),
                    embedding vector(1536),
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP
                )
                """);
            log.info("article_embeddings 表创建成功");

            // 创建索引
            jdbcTemplate.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_article_embeddings_article_id 
                ON article_embeddings(article_id)
                """);
            log.info("article_embeddings 索引创建成功");

        } catch (Exception e) {
            log.error("初始化 pgvector 表失败: {}", e.getMessage());
            // 不抛出异常，允许应用继续启动
        }
    }
}
