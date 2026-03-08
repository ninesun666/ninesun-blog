-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create article_embeddings table if not exists (will be managed by JPA, but this ensures the extension is loaded)
-- Note: The actual table is created by Hibernate, this just ensures pgvector is available
