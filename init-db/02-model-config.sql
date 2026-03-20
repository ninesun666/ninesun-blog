-- 模型提供商配置表
CREATE TABLE IF NOT EXISTS model_providers (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL UNIQUE, -- 'openai', 'azure', 'anthropic', 'gemini', 'local'
    name VARCHAR(100) NOT NULL, -- 显示名称
    description TEXT,
    enabled BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0, -- 优先级，数字越小优先级越高
    config JSONB NOT NULL DEFAULT '{}', -- 配置参数（API密钥等）
    models JSONB NOT NULL DEFAULT '[]', -- 支持的模型列表
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 模型配置表（支持同一提供商配置多个模型）
CREATE TABLE IF NOT EXISTS model_configs (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT REFERENCES model_providers(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL, -- 模型标识名，如 gpt-4, claude-3-opus
    display_name VARCHAR(100) NOT NULL, -- 显示名称
    type VARCHAR(20) NOT NULL DEFAULT 'chat', -- 'chat' | 'embedding' | 'tts' | 'stt'
    enabled BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false, -- 是否默认模型
    parameters JSONB NOT NULL DEFAULT '{}', -- 模型参数（temperature, max_tokens等）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id, model_name, type)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_model_providers_enabled ON model_providers(enabled);
CREATE INDEX IF NOT EXISTS idx_model_configs_provider ON model_configs(provider_id);
CREATE INDEX IF NOT EXISTS idx_model_configs_type ON model_configs(type);
CREATE INDEX IF NOT EXISTS idx_model_configs_enabled ON model_configs(enabled);

-- 插入默认提供商配置
INSERT INTO model_providers (provider, name, description, enabled, priority, config, models)
VALUES 
    ('openai', 'OpenAI', 'OpenAI API 服务', true, 1, 
     '{"base_url": "https://api.openai.com/v1", "api_key": ""}'::jsonb,
     '[
         {"name": "gpt-4o", "display_name": "GPT-4o", "max_tokens": 8192},
         {"name": "gpt-4o-mini", "display_name": "GPT-4o Mini", "max_tokens": 8192},
         {"name": "gpt-4", "display_name": "GPT-4", "max_tokens": 8192},
         {"name": "gpt-3.5-turbo", "display_name": "GPT-3.5 Turbo", "max_tokens": 4096},
         {"name": "text-embedding-3-small", "display_name": "Embedding Small", "dimensions": 1536},
         {"name": "text-embedding-3-large", "display_name": "Embedding Large", "dimensions": 3072},
         {"name": "tts-1", "display_name": "TTS", "voices": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]},
         {"name": "whisper-1", "display_name": "Whisper", "language": "auto"}
     ]'::jsonb),
     
    ('azure', 'Azure OpenAI', 'Azure OpenAI 服务', false, 2,
     '{"endpoint": "", "api_key": "", "api_version": "2024-02-01"}'::jsonb,
     '[]'::jsonb),
     
    ('anthropic', 'Anthropic', 'Claude 模型', false, 3,
     '{"base_url": "https://api.anthropic.com", "api_key": ""}'::jsonb,
     '[
         {"name": "claude-3-opus-20240229", "display_name": "Claude 3 Opus", "max_tokens": 4096},
         {"name": "claude-3-sonnet-20240229", "display_name": "Claude 3 Sonnet", "max_tokens": 4096},
         {"name": "claude-3-haiku-20240307", "display_name": "Claude 3 Haiku", "max_tokens": 4096}
     ]'::jsonb),
     
    ('gemini', 'Google Gemini', 'Google Gemini API', false, 4,
     '{"api_key": ""}'::jsonb,
     '[
         {"name": "gemini-pro", "display_name": "Gemini Pro", "max_tokens": 8192},
         {"name": "gemini-pro-vision", "display_name": "Gemini Pro Vision", "max_tokens": 8192}
     ]'::jsonb),
     
    ('ollama', 'Ollama', '本地 Ollama 服务', false, 5,
     '{"base_url": "http://localhost:11434"}'::jsonb,
     '[
         {"name": "llama2", "display_name": "Llama 2", "max_tokens": 4096},
         {"name": "mistral", "display_name": "Mistral", "max_tokens": 4096},
         {"name": "qwen", "display_name": "通义千问", "max_tokens": 4096}
     ]'::jsonb),
     
    ('siliconflow', 'SiliconFlow', '硅基流动 API', false, 6,
     '{"base_url": "https://api.siliconflow.cn/v1", "api_key": ""}'::jsonb,
     '[
         {"name": "deepseek-ai/DeepSeek-V2.5", "display_name": "DeepSeek V2.5", "max_tokens": 8192},
         {"name": "Qwen/Qwen2.5-72B-Instruct", "display_name": "Qwen2.5 72B", "max_tokens": 8192},
         {"name": "THUDM/glm-4-9b-chat", "display_name": "GLM-4 9B", "max_tokens": 8192}
     ]'::jsonb)
ON CONFLICT (provider) DO NOTHING;

-- 插入默认模型配置
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
ON CONFLICT DO NOTHING;

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
ON CONFLICT DO NOTHING;
