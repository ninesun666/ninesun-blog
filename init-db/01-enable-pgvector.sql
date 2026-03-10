-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create article_embeddings table if not exists
-- Hibernate ddl-auto 无法正确处理 vector 类型，需要手动创建
-- 使用 IF NOT EXISTS 确保幂等性，不会删除已有数据
CREATE TABLE IF NOT EXISTS article_embeddings (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT UNIQUE NOT NULL,
    content_hash VARCHAR(64),
    embedding vector(1536),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 为 article_id 创建索引（如果不存在）
CREATE UNIQUE INDEX IF NOT EXISTS idx_article_embeddings_article_id ON article_embeddings(article_id);

-- 为 vector 列创建 IVFFlat 索引（需要表中有数据后才能创建，这里先注释）
-- 当表中有 1000+ 条数据后，可以手动执行：
-- CREATE INDEX IF NOT EXISTS idx_article_embeddings_vector ON article_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
