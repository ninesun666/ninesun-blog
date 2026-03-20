# 知识库与 AI 语音助手系统设计方案

## 一、系统概述

基于 pgvector 构建知识库系统，增强 AI 助手对话功能，支持语音交互。

---

## 二、核心功能

### 1. 知识库后台管理
- 多知识库管理（文章库/文档库/混合库）
- 文档上传（PDF/Word/Markdown/TXT）
- 文本分块与向量化
- 向量搜索测试工具

### 2. AI 助手对话增强
- 展示向量数据来源（知识库 + 具体文档 + 分块内容）
- 引用溯源卡片（可展开查看原文）
- 知识库选择器（切换不同知识库问答）

### 3. 语音对话功能
- 语音识别（STT）：使用 Web Speech API 或 Whisper
- 语音合成（TTS）：使用 Web Speech API 或第三方 TTS
- 语音消息展示与播放
- 语音输入按钮

---

## 三、数据库设计

### 3.1 知识库表 (knowledge_bases)
```sql
CREATE TABLE knowledge_bases (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20), -- 'article' | 'upload' | 'mixed'
    status VARCHAR(20) DEFAULT 'active',
    config JSONB, -- 分块策略、向量化模型等配置
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 文档表 (kb_documents)
```sql
CREATE TABLE kb_documents (
    id BIGSERIAL PRIMARY KEY,
    kb_id BIGINT REFERENCES knowledge_bases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    source_type VARCHAR(20), -- 'article' | 'upload' | 'url'
    source_id BIGINT, -- 关联文章ID或外部ID
    file_path VARCHAR(500),
    file_type VARCHAR(50), -- 'pdf' | 'docx' | 'md' | 'txt'
    file_size BIGINT,
    content_hash VARCHAR(64),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'error'
    error_message TEXT,
    chunk_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 分块表 (kb_chunks)
```sql
CREATE TABLE kb_chunks (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT REFERENCES kb_documents(id) ON DELETE CASCADE,
    kb_id BIGINT REFERENCES knowledge_bases(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    chunk_index INTEGER,
    token_count INTEGER,
    metadata JSONB, -- 页码、章节等元信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.4 向量表 (kb_embeddings)
```sql
CREATE TABLE kb_embeddings (
    id BIGSERIAL PRIMARY KEY,
    chunk_id BIGINT REFERENCES kb_chunks(id) ON DELETE CASCADE,
    kb_id BIGINT REFERENCES knowledge_bases(id) ON DELETE CASCADE,
    content_hash VARCHAR(64),
    embedding vector(1536),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HNSW 索引（高性能向量搜索）
CREATE INDEX idx_kb_embeddings_hnsw ON kb_embeddings 
    USING hnsw (embedding vector_cosine_ops);
    
-- 知识库查询索引
CREATE INDEX idx_kb_embeddings_kb_id ON kb_embeddings(kb_id);
```

---

## 四、后端设计

### 4.1 Entity 层

**KnowledgeBase.java**
```java
@Entity
@Table(name = "knowledge_bases")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private KnowledgeBaseType type = KnowledgeBaseType.CUSTOM;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private KnowledgeBaseStatus status = KnowledgeBaseStatus.ACTIVE;
    
    @Column(columnDefinition = "jsonb")
    private String config;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    public enum KnowledgeBaseType {
        ARTICLE, CUSTOM, MIXED
    }
    
    public enum KnowledgeBaseStatus {
        ACTIVE, INACTIVE
    }
}
```

**KbDocument.java**
```java
@Entity
@Table(name = "kb_documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KbDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kb_id", nullable = false)
    private KnowledgeBase knowledgeBase;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SourceType sourceType;
    
    @Column(name = "source_id")
    private Long sourceId;
    
    @Column(length = 500)
    private String filePath;
    
    @Column(length = 50)
    private String fileType;
    
    private Long fileSize;
    
    @Column(length = 64)
    private String contentHash;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DocumentStatus status = DocumentStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    
    private Integer chunkCount = 0;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    public enum SourceType {
        ARTICLE, UPLOAD, URL
    }
    
    public enum DocumentStatus {
        PENDING, PROCESSING, COMPLETED, ERROR
    }
}
```

**KbChunk.java**
```java
@Entity
@Table(name = "kb_chunks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KbChunk {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private KbDocument document;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kb_id", nullable = false)
    private KnowledgeBase knowledgeBase;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "chunk_index")
    private Integer chunkIndex;
    
    @Column(name = "token_count")
    private Integer tokenCount;
    
    @Column(columnDefinition = "jsonb")
    private String metadata;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

**KbEmbedding.java**
```java
@Entity
@Table(name = "kb_embeddings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KbEmbedding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chunk_id", nullable = false)
    private KbChunk chunk;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kb_id", nullable = false)
    private KnowledgeBase knowledgeBase;
    
    @Column(length = 64)
    private String contentHash;
    
    @Column(nullable = false, columnDefinition = "vector(1536)")
    private float[] embedding;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### 4.2 Repository 层

**KnowledgeBaseRepository.java**
```java
@Repository
public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBase, Long> {
    List<KnowledgeBase> findByStatus(KnowledgeBase.KnowledgeBaseStatus status);
}
```

**KbDocumentRepository.java**
```java
@Repository
public interface KbDocumentRepository extends JpaRepository<KbDocument, Long> {
    List<KbDocument> findByKnowledgeBaseId(Long kbId);
    List<KbDocument> findByKnowledgeBaseIdAndStatus(Long kbId, KbDocument.DocumentStatus status);
    
    @Query("SELECT COUNT(d) FROM KbDocument d WHERE d.knowledgeBase.id = :kbId")
    Long countByKnowledgeBaseId(@Param("kbId") Long kbId);
}
```

**KbEmbeddingCustomRepository.java**
```java
@Repository
@RequiredArgsConstructor
public class KbEmbeddingCustomRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    /**
     * 在指定知识库中搜索相似向量
     */
    public List<KbSearchResult> searchInKnowledgeBase(Long kbId, String queryVector, int limit) {
        String sql = """
            SELECT 
                ke.id as embedding_id,
                ke.chunk_id,
                kc.content,
                kc.document_id,
                kd.title as document_title,
                ke.embedding <=> CAST(? AS vector) AS distance
            FROM kb_embeddings ke
            JOIN kb_chunks kc ON ke.chunk_id = kc.id
            JOIN kb_documents kd ON kc.document_id = kd.id
            WHERE ke.kb_id = ?
            ORDER BY ke.embedding <=> CAST(? AS vector)
            LIMIT ?
            """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            KbSearchResult result = new KbSearchResult();
            result.setEmbeddingId(rs.getLong("embedding_id"));
            result.setChunkId(rs.getLong("chunk_id"));
            result.setContent(rs.getString("content"));
            result.setDocumentId(rs.getLong("document_id"));
            result.setDocumentTitle(rs.getString("document_title"));
            result.setDistance(rs.getDouble("distance"));
            return result;
        }, queryVector, kbId, queryVector, limit);
    }
    
    /**
     * 删除知识库的所有向量
     */
    public void deleteByKnowledgeBaseId(Long kbId) {
        String sql = "DELETE FROM kb_embeddings WHERE kb_id = ?";
        jdbcTemplate.update(sql, kbId);
    }
}
```

### 4.3 Service 层

**KnowledgeBaseService.java**
```java
public interface KnowledgeBaseService {
    // 知识库管理
    KnowledgeBase createKnowledgeBase(KnowledgeBaseDTO dto);
    KnowledgeBase updateKnowledgeBase(Long id, KnowledgeBaseDTO dto);
    void deleteKnowledgeBase(Long id);
    Page<KnowledgeBase> listKnowledgeBases(Pageable pageable);
    KnowledgeBase getKnowledgeBase(Long id);
    
    // 文档管理
    KbDocument uploadDocument(Long kbId, MultipartFile file);
    KbDocument syncArticle(Long kbId, Long articleId);
    void deleteDocument(Long documentId);
    KbDocument getDocument(Long documentId);
    Page<KbDocument> listDocuments(Long kbId, Pageable pageable);
    
    // 向量操作
    void rebuildDocumentVectors(Long documentId);
    void rebuildAllVectors(Long kbId);
    
    // 搜索测试
    List<KbSearchResult> searchTest(Long kbId, String query, int limit);
    
    // 统计
    KnowledgeBaseStats getStats(Long kbId);
}
```

**DocumentProcessingService.java**
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentProcessingService {
    
    private final EmbeddingService embeddingService;
    private final KbDocumentRepository documentRepository;
    private final KbChunkRepository chunkRepository;
    private final KbEmbeddingRepository embeddingRepository;
    
    /**
     * 解析 PDF 文件
     */
    public String extractTextFromPdf(MultipartFile file) {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (IOException e) {
            throw new RuntimeException("PDF解析失败", e);
        }
    }
    
    /**
     * 解析 Word 文件
     */
    public String extractTextFromWord(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            XWPFDocument document = new XWPFDocument(is);
            StringBuilder text = new StringBuilder();
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                text.append(paragraph.getText()).append("\n");
            }
            return text.toString();
        } catch (IOException e) {
            throw new RuntimeException("Word解析失败", e);
        }
    }
    
    /**
     * 文本分块
     */
    public List<String> splitText(String text, ChunkConfig config) {
        List<String> chunks = new ArrayList<>();
        int chunkSize = config.getChunkSize();
        int overlap = config.getOverlap();
        
        // 按段落分割
        String[] paragraphs = text.split("\n\n");
        StringBuilder currentChunk = new StringBuilder();
        
        for (String paragraph : paragraphs) {
            if (currentChunk.length() + paragraph.length() > chunkSize) {
                if (currentChunk.length() > 0) {
                    chunks.add(currentChunk.toString().trim());
                    // 保留重叠部分
                    String chunkText = currentChunk.toString();
                    int overlapStart = Math.max(0, chunkText.length() - overlap);
                    currentChunk = new StringBuilder(chunkText.substring(overlapStart));
                }
            }
            currentChunk.append(paragraph).append("\n\n");
        }
        
        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString().trim());
        }
        
        return chunks;
    }
    
    /**
     * 处理文档：分块 + 向量化
     */
    @Transactional
    public void processDocument(Long documentId) {
        KbDocument document = documentRepository.findById(documentId)
            .orElseThrow(() -> new IllegalArgumentException("文档不存在"));
        
        try {
            // 更新状态为处理中
            document.setStatus(KbDocument.DocumentStatus.PROCESSING);
            documentRepository.save(document);
            
            // 删除旧的分块和向量
            deleteDocumentChunks(documentId);
            
            // 提取文本
            String content = extractDocumentContent(document);
            
            // 分块
            ChunkConfig config = getChunkConfig(document.getKnowledgeBase());
            List<String> chunks = splitText(content, config);
            
            // 保存分块并生成向量
            for (int i = 0; i < chunks.size(); i++) {
                String chunkText = chunks.get(i);
                
                // 保存分块
                KbChunk chunk = KbChunk.builder()
                    .document(document)
                    .knowledgeBase(document.getKnowledgeBase())
                    .content(chunkText)
                    .chunkIndex(i)
                    .tokenCount(chunkText.length())
                    .build();
                chunk = chunkRepository.save(chunk);
                
                // 生成向量
                float[] embedding = embeddingService.generateEmbedding(chunkText);
                KbEmbedding kbEmbedding = KbEmbedding.builder()
                    .chunk(chunk)
                    .knowledgeBase(document.getKnowledgeBase())
                    .embedding(embedding)
                    .build();
                embeddingRepository.save(kbEmbedding);
            }
            
            // 更新文档状态
            document.setStatus(KbDocument.DocumentStatus.COMPLETED);
            document.setChunkCount(chunks.size());
            documentRepository.save(document);
            
        } catch (Exception e) {
            log.error("文档处理失败", e);
            document.setStatus(KbDocument.DocumentStatus.ERROR);
            document.setErrorMessage(e.getMessage());
            documentRepository.save(document);
        }
    }
}
```

### 4.4 Controller 层

**KnowledgeBaseController.java**
```java
@RestController
@RequestMapping("/api/admin/knowledge")
@RequiredArgsConstructor
public class KnowledgeBaseController {
    
    private final KnowledgeBaseService knowledgeBaseService;
    private final DocumentProcessingService documentProcessingService;
    
    // ========== 知识库管理 ==========
    
    @GetMapping("/bases")
    public ResponseEntity<Page<KnowledgeBase>> listKnowledgeBases(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(knowledgeBaseService.listKnowledgeBases(pageable));
    }
    
    @PostMapping("/bases")
    public ResponseEntity<KnowledgeBase> createKnowledgeBase(@RequestBody @Valid KnowledgeBaseDTO dto) {
        return ResponseEntity.ok(knowledgeBaseService.createKnowledgeBase(dto));
    }
    
    @PutMapping("/bases/{id}")
    public ResponseEntity<KnowledgeBase> updateKnowledgeBase(
            @PathVariable Long id,
            @RequestBody @Valid KnowledgeBaseDTO dto) {
        return ResponseEntity.ok(knowledgeBaseService.updateKnowledgeBase(id, dto));
    }
    
    @DeleteMapping("/bases/{id}")
    public ResponseEntity<Void> deleteKnowledgeBase(@PathVariable Long id) {
        knowledgeBaseService.deleteKnowledgeBase(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/bases/{id}")
    public ResponseEntity<KnowledgeBase> getKnowledgeBase(@PathVariable Long id) {
        return ResponseEntity.ok(knowledgeBaseService.getKnowledgeBase(id));
    }
    
    // ========== 文档管理 ==========
    
    @GetMapping("/bases/{kbId}/documents")
    public ResponseEntity<Page<KbDocument>> listDocuments(
            @PathVariable Long kbId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(knowledgeBaseService.listDocuments(kbId, pageable));
    }
    
    @PostMapping("/bases/{kbId}/documents/upload")
    public ResponseEntity<KbDocument> uploadDocument(
            @PathVariable Long kbId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(knowledgeBaseService.uploadDocument(kbId, file));
    }
    
    @PostMapping("/bases/{kbId}/documents/sync-article")
    public ResponseEntity<KbDocument> syncArticle(
            @PathVariable Long kbId,
            @RequestParam Long articleId) {
        return ResponseEntity.ok(knowledgeBaseService.syncArticle(kbId, articleId));
    }
    
    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        knowledgeBaseService.deleteDocument(id);
        return ResponseEntity.ok().build();
    }
    
    // ========== 向量操作 ==========
    
    @PostMapping("/documents/{id}/rebuild")
    public ResponseEntity<Void> rebuildDocumentVectors(@PathVariable Long id) {
        documentProcessingService.processDocument(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/bases/{kbId}/rebuild-all")
    public ResponseEntity<Void> rebuildAllVectors(@PathVariable Long kbId) {
        knowledgeBaseService.rebuildAllVectors(kbId);
        return ResponseEntity.ok().build();
    }
    
    // ========== 搜索测试 ==========
    
    @PostMapping("/bases/{kbId}/search-test")
    public ResponseEntity<List<KbSearchResult>> searchTest(
            @PathVariable Long kbId,
            @RequestBody SearchTestRequest request) {
        return ResponseEntity.ok(knowledgeBaseService.searchTest(kbId, request.getQuery(), request.getLimit()));
    }
    
    // ========== 统计 ==========
    
    @GetMapping("/bases/{kbId}/stats")
    public ResponseEntity<KnowledgeBaseStats> getStats(@PathVariable Long kbId) {
        return ResponseEntity.ok(knowledgeBaseService.getStats(kbId));
    }
}
```

### 4.5 AI 助手增强

**EnhancedRagService.java**
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class EnhancedRagService {
    
    private final EmbeddingService embeddingService;
    private final KbEmbeddingCustomRepository embeddingRepository;
    private final KnowledgeBaseRepository knowledgeBaseRepository;
    private final WebClient webClient;
    
    @Value("${openai.api-key}")
    private String openaiApiKey;
    
    @Value("${openai.base-url:https://api.openai.com/v1}")
    private String openaiBaseUrl;
    
    @Value("${openai.chat-model:gpt-4}")
    private String chatModel;
    
    /**
     * 增强版对话，支持知识库选择和来源展示
     */
    public ChatResponse chat(ChatRequest request, Long knowledgeBaseId) {
        // 1. 确定知识库
        KnowledgeBase knowledgeBase = knowledgeBaseId != null 
            ? knowledgeBaseRepository.findById(knowledgeBaseId)
                .orElseThrow(() -> new IllegalArgumentException("知识库不存在"))
            : getDefaultKnowledgeBase();
        
        // 2. 生成查询向量
        float[] queryEmbedding = embeddingService.generateEmbedding(request.getMessage());
        String queryVector = embeddingService.embeddingToString(queryEmbedding);
        
        // 3. 在指定知识库中搜索
        List<KbSearchResult> searchResults = embeddingRepository
            .searchInKnowledgeBase(knowledgeBase.getId(), queryVector, 5);
        
        // 4. 过滤并构建来源
        List<SourceCitation> sources = searchResults.stream()
            .filter(r -> r.getDistance() < 0.5) // 相似度阈值
            .map(r -> SourceCitation.builder()
                .documentId(r.getDocumentId())
                .documentTitle(r.getDocumentTitle())
                .chunkContent(r.getContent())
                .relevanceScore(1 - r.getDistance())
                .knowledgeBaseName(knowledgeBase.getName())
                .build())
            .collect(Collectors.toList());
        
        // 5. 构建带引用的上下文
        String context = buildContext(sources);
        
        // 6. 调用 LLM
        String response = callLLM(request.getMessage(), context, request.getHistory());
        
        return ChatResponse.builder()
            .response(response)
            .sources(sources)
            .knowledgeBaseId(knowledgeBase.getId())
            .knowledgeBaseName(knowledgeBase.getName())
            .build();
    }
    
    private String buildContext(List<SourceCitation> sources) {
        if (sources.isEmpty()) {
            return "";
        }
        
        StringBuilder context = new StringBuilder();
        context.append("以下是与用户问题相关的参考内容：\n\n");
        
        for (int i = 0; i < sources.size(); i++) {
            SourceCitation source = sources.get(i);
            context.append("[").append(i + 1).append("] ")
                   .append(source.getDocumentTitle())
                   .append("\n")
                   .append(source.getChunkContent())
                   .append("\n\n");
        }
        
        context.append("请基于以上参考内容回答用户的问题。如果参考内容不足以回答问题，请明确说明。");
        return context.toString();
    }
    
    private String callLLM(String query, String context, String history) {
        String systemPrompt = "你是一个专业的知识库助手，基于提供的参考内容回答用户问题。请准确引用参考内容，并在必要时提供来源信息。";
        
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        
        if (StringUtils.hasText(history)) {
            messages.add(Map.of("role", "user", "content", "之前的对话历史：\n" + history));
        }
        
        if (StringUtils.hasText(context)) {
            messages.add(Map.of("role", "user", "content", context));
        }
        
        messages.add(Map.of("role", "user", "content", query));
        
        Map<String, Object> requestBody = Map.of(
            "model", chatModel,
            "messages", messages,
            "temperature", 0.7,
            "max_tokens", 2000
        );
        
        return webClient.post()
            .uri(openaiBaseUrl + "/chat/completions")
            .header("Authorization", "Bearer " + openaiApiKey)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(Map.class)
            .map(response -> {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
                return "抱歉，无法生成回答。";
            })
            .block();
    }
    
    private KnowledgeBase getDefaultKnowledgeBase() {
        // 获取默认知识库，如果没有则使用第一个活跃的
        return knowledgeBaseRepository.findByStatus(KnowledgeBase.KnowledgeBaseStatus.ACTIVE)
            .stream()
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("没有可用的知识库"));
    }
}
```

**AIController.java（增强版）**
```java
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {
    
    private final EnhancedRagService enhancedRagService;
    private final SpeechService speechService;
    
    /**
     * 增强版对话接口，支持知识库选择和来源展示
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request,
            @RequestParam(required = false) Long knowledgeBaseId) {
        ChatResponse response = enhancedRagService.chat(request, knowledgeBaseId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 语音转文字
     */
    @PostMapping("/speech-to-text")
    public ResponseEntity<String> speechToText(
            @RequestParam("audio") MultipartFile audio) {
        String text = speechService.transcribe(audio);
        return ResponseEntity.ok(text);
    }
    
    /**
     * 文字转语音
     */
    @PostMapping("/text-to-speech")
    public ResponseEntity<byte[]> textToSpeech(@RequestBody String text) {
        byte[] audio = speechService.synthesize(text);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(audio);
    }
    
    /**
     * 获取可用知识库列表
     */
    @GetMapping("/knowledge-bases")
    public ResponseEntity<List<KnowledgeBase>> getKnowledgeBases() {
        return ResponseEntity.ok(enhancedRagService.getActiveKnowledgeBases());
    }
}
```

---

## 五、前端设计

### 5.1 类型定义

**types/knowledge.ts**
```typescript
export interface KnowledgeBase {
  id: number
  name: string
  description?: string
  type: 'article' | 'custom' | 'mixed'
  status: 'active' | 'inactive'
  config?: KnowledgeBaseConfig
  createdAt: string
  updatedAt: string
}

export interface KnowledgeBaseConfig {
  chunkSize: number
  overlap: number
  embeddingModel: string
}

export interface KbDocument {
  id: number
  kbId: number
  title: string
  sourceType: 'article' | 'upload' | 'url'
  sourceId?: number
  filePath?: string
  fileType?: string
  fileSize?: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  errorMessage?: string
  chunkCount: number
  createdAt: string
  updatedAt: string
}

export interface KbChunk {
  id: number
  documentId: number
  content: string
  chunkIndex: number
  tokenCount: number
  metadata?: Record<string, any>
}

export interface SourceCitation {
  documentId: number
  documentTitle: string
  chunkContent: string
  relevanceScore: number
  knowledgeBaseName: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  type: 'text' | 'voice'
  audioUrl?: string
  sources?: SourceCitation[]
  knowledgeBaseName?: string
}

export interface ChatRequest {
  message: string
  history?: string
  knowledgeBaseId?: number
}

export interface ChatResponse {
  response: string
  sources?: SourceCitation[]
  knowledgeBaseId: number
  knowledgeBaseName: string
}
```

### 5.2 API 封装

**api/knowledge.ts**
```typescript
import { api, uploadApi } from './client'
import type { KnowledgeBase, KbDocument, ChatResponse } from '../types'

export const knowledgeApi = {
  // 知识库管理
  getBases: () => api.get<KnowledgeBase[]>('/admin/knowledge/bases'),
  getBase: (id: number) => api.get<KnowledgeBase>(`/admin/knowledge/bases/${id}`),
  createBase: (data: Partial<KnowledgeBase>) => api.post<KnowledgeBase>('/admin/knowledge/bases', data),
  updateBase: (id: number, data: Partial<KnowledgeBase>) => 
    api.put<KnowledgeBase>(`/admin/knowledge/bases/${id}`, data),
  deleteBase: (id: number) => api.delete(`/admin/knowledge/bases/${id}`),
  
  // 文档管理
  getDocuments: (kbId: number, page = 0, size = 20) => 
    api.get(`/admin/knowledge/bases/${kbId}/documents?page=${page}&size=${size}`),
  uploadDocument: (kbId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return uploadApi.post<KbDocument>(`/admin/knowledge/bases/${kbId}/documents/upload`, formData)
  },
  syncArticle: (kbId: number, articleId: number) => 
    api.post<KbDocument>(`/admin/knowledge/bases/${kbId}/documents/sync-article?articleId=${articleId}`),
  deleteDocument: (id: number) => api.delete(`/admin/knowledge/documents/${id}`),
  
  // 向量操作
  rebuildDocument: (id: number) => api.post(`/admin/knowledge/documents/${id}/rebuild`),
  rebuildAll: (kbId: number) => api.post(`/admin/knowledge/bases/${kbId}/rebuild-all`),
  
  // 搜索测试
  searchTest: (kbId: number, query: string, limit = 5) => 
    api.post(`/admin/knowledge/bases/${kbId}/search-test`, { query, limit }),
  
  // 统计
  getStats: (kbId: number) => api.get(`/admin/knowledge/bases/${kbId}/stats`),
}

export const aiApi = {
  // AI 对话
  chat: (message: string, knowledgeBaseId?: number, history?: string) => 
    api.post<ChatResponse>('/ai/chat', { message, history }, { 
      params: knowledgeBaseId ? { knowledgeBaseId } : undefined 
    }),
  
  // 获取知识库列表
  getKnowledgeBases: () => api.get<KnowledgeBase[]>('/ai/knowledge-bases'),
  
  // 语音转文字
  speechToText: (audioBlob: Blob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob)
    return uploadApi.post<string>('/ai/speech-to-text', formData)
  },
  
  // 文字转语音
  textToSpeech: (text: string) => 
    api.post<Blob>('/ai/text-to-speech', text, { responseType: 'blob' }),
}
```

### 5.3 语音功能 Hook

**hooks/useVoiceChat.ts**
```typescript
import { useState, useRef, useCallback } from 'react'

interface UseVoiceChatOptions {
  onTranscript?: (text: string) => void
  onError?: (error: string) => void
}

export function useVoiceChat(options: UseVoiceChatOptions = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  
  // 开始录音（语音识别）
  const startRecording = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      options.onError?.('浏览器不支持语音识别')
      return
    }
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognitionAPI()
    
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = false
    
    recognition.onstart = () => setIsRecording(true)
    recognition.onend = () => setIsRecording(false)
    recognition.onerror = (event) => {
      setIsRecording(false)
      options.onError?.(`语音识别错误: ${event.error}`)
    }
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      options.onTranscript?.(transcript)
    }
    
    recognition.start()
    recognitionRef.current = recognition
  }, [options])
  
  // 停止录音
  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }, [])
  
  // 播放语音（文字转语音）
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      options.onError?.('浏览器不支持语音合成')
      return
    }
    
    // 停止之前的播放
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 1
    utterance.pitch = 1
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    window.speechSynthesis.speak(utterance)
    synthesisRef.current = utterance
  }, [options])
  
  // 停止播放
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])
  
  return {
    isRecording,
    isSpeaking,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  }
}
```

### 5.4 AI 助手组件（增强版）

**components/AIChat.tsx**
```typescript
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Box, Flex, VStack, HStack, Text, IconButton, Input, Spinner, 
  Card, Link, Presence, useBreakpointValue, Select, Accordion,
  Badge, Tooltip
} from '@chakra-ui/react'
import { FiMessageCircle, FiX, FiSend, FiSmartphone, FiMic, FiMicOff, FiVolume2, FiVolumeX } from 'react-icons/fi'
import { useColorModeValue } from './ui/color-mode'
import { useVoiceChat } from '../hooks/useVoiceChat'
import { aiApi } from '../api'
import type { ChatMessage, SourceCitation, KnowledgeBase } from '../types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  type: 'text' | 'voice'
  audioUrl?: string
  sources?: SourceCitation[]
  knowledgeBaseName?: string
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [selectedKb, setSelectedKb] = useState<number | undefined>()
  const [autoSpeak, setAutoSpeak] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { isRecording, startRecording, stopRecording, speak, stopSpeaking } = useVoiceChat({
    onTranscript: (text) => {
      setInput(text)
      sendMessage(text)
    },
    onError: (error) => toast.error(error),
  })
  
  // 主题色
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const headerBg = useColorModeValue('purple.500', 'purple.600')
  const userBg = useColorModeValue('purple.500', 'purple.600')
  const assistantBg = useColorModeValue('gray.100', 'gray.700')
  
  // 响应式尺寸
  const chatWidth = useBreakpointValue({ base: 'calc(100vw - 32px)', md: '420px' })
  const chatHeight = useBreakpointValue({ base: '65vh', md: '550px' })
  
  // 加载知识库列表
  useEffect(() => {
    if (isOpen) {
      aiApi.getKnowledgeBases().then(res => {
        setKnowledgeBases(res.data)
      }).catch(() => {})
    }
  }, [isOpen])
  
  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // 聚焦输入框
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])
  
  // 欢迎消息
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是 AI 助手。我可以基于知识库回答你的问题。',
        type: 'text',
      }])
    }
  }, [isOpen, messages.length])
  
  const sendMessage = useCallback(async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || isLoading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      type: 'text',
    }
    
    setMessages(prev => [...prev, userMessage])
    if (!text) setInput('')
    setIsLoading(true)
    
    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => `${m.role}: ${m.content}`)
        .join('\n')
      
      const response = await aiApi.chat(messageText, selectedKb, history)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        type: 'text',
        sources: response.data.sources,
        knowledgeBaseName: response.data.knowledgeBaseName,
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      // 自动播放语音
      if (autoSpeak) {
        speak(response.data.response)
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，处理请求时出现问题。',
        type: 'text',
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, selectedKb, autoSpeak, speak])
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  
  return (
    <Box position="fixed" bottom={6} right={6} zIndex={1000}>
      {/* 聊天按钮 */}
      <IconButton
        aria-label="打开AI助手"
        size="lg"
        borderRadius="full"
        colorPalette="purple"
        boxShadow="lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX /> : <FiMessageCircle />}
      </IconButton>
      
      {/* 聊天窗口 */}
      <Presence present={isOpen}>
        <Card.Root
          position="absolute"
          bottom="70px"
          right={0}
          w={chatWidth}
          h={chatHeight}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="2xl"
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          style={{ display: isOpen ? 'block' : 'none' }}
        >
          {/* 头部 */}
          <Box bg={headerBg} px={4} py={3} color="white">
            <HStack gap={2} justify="space-between">
              <HStack gap={2}>
                <FiSmartphone size={20} />
                <Text fontWeight="bold">AI 助手</Text>
              </HStack>
              <Tooltip title={autoSpeak ? '自动朗读开启' : '自动朗读关闭'}>
                <IconButton
                  size="sm"
                  variant="ghost"
                  color="white"
                  onClick={() => setAutoSpeak(!autoSpeak)}
                >
                  {autoSpeak ? <FiVolume2 /> : <FiVolumeX />}
                </IconButton>
              </Tooltip>
            </HStack>
            
            {/* 知识库选择器 */}
            <Select
              size="xs"
              mt={2}
              bg="whiteAlpha.200"
              borderColor="whiteAlpha.300"
              value={selectedKb || ''}
              onChange={(e) => setSelectedKb(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">默认知识库</option>
              {knowledgeBases.map(kb => (
                <option key={kb.id} value={kb.id}>{kb.name}</option>
              ))}
            </Select>
          </Box>
          
          {/* 消息列表 */}
          <VStack
            flex={1}
            overflowY="auto"
            p={4}
            gap={3}
            align="stretch"
            h="calc(100% - 160px)"
          >
            {messages.map(msg => (
              <Box
                key={msg.id}
                alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                maxW="90%"
              >
                <Box
                  bg={msg.role === 'user' ? userBg : assistantBg}
                  color={msg.role === 'user' ? 'white' : 'inherit'}
                  px={4}
                  py={3}
                  borderRadius="lg"
                  fontSize="sm"
                  whiteSpace="pre-wrap"
                >
                  {msg.content}
                </Box>
                
                {/* 来源引用 */}
                {msg.sources && msg.sources.length > 0 && (
                  <Accordion.Root mt={2} multiple>
                    <Accordion.Item value="sources">
                      <Accordion.ItemTrigger>
                        <Badge size="sm" colorPalette="purple">
                          参考来源 ({msg.sources.length})
                        </Badge>
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent>
                        <VStack align="stretch" gap={2} mt={2}>
                          {msg.sources.map((source, idx) => (
                            <Box
                              key={idx}
                              p={2}
                              bg="whiteAlpha.500"
                              borderRadius="md"
                              fontSize="xs"
                            >
                              <HStack justify="space-between">
                                <Text fontWeight="bold">{source.documentTitle}</Text>
                                <Badge size="sm">
                                  相关度 {(source.relevanceScore * 100).toFixed(0)}%
                                </Badge>
                              </HStack>
                              <Text color="gray.600" mt={1} noOfLines={2}>
                                {source.chunkContent}
                              </Text>
                            </Box>
                          ))}
                        </VStack>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  </Accordion.Root>
                )}
                
                {msg.knowledgeBaseName && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    来自: {msg.knowledgeBaseName}
                  </Text>
                )}
              </Box>
            ))}
            
            {isLoading && (
              <Box bg={assistantBg} px={4} py={3} borderRadius="lg" alignSelf="flex-start">
                <Spinner size="sm" />
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </VStack>
          
          {/* 输入框 */}
          <Flex p={3} gap={2} borderTop="1px" borderColor={borderColor}>
            <IconButton
              aria-label={isRecording ? '停止录音' : '语音输入'}
              size="sm"
              colorPalette={isRecording ? 'red' : 'gray'}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <FiMicOff /> : <FiMic />}
            </IconButton>
            
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入问题..."
              size="sm"
              disabled={isLoading}
            />
            
            <IconButton
              aria-label="发送"
              size="sm"
              colorPalette="purple"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
            >
              <FiSend />
            </IconButton>
          </Flex>
        </Card.Root>
      </Presence>
    </Box>
  )
}
```

### 5.5 知识库管理页面

**pages/admin/AdminKnowledge.tsx**
```typescript
import { useState } from 'react'
import {
  Box, Tabs, TabList, TabPanels, Tab, TabPanel, Button, 
  Table, Badge, IconButton, HStack, VStack, Text, Heading,
  Dialog, Input, Textarea, Select, useDisclosure
} from '@chakra-ui/react'
import { FiPlus, FiTrash2, FiRefreshCw, FiSearch } from 'react-icons/fi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { knowledgeApi } from '../../api'
import type { KnowledgeBase, KbDocument } from '../../types'

export default function AdminKnowledge() {
  const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null)
  const queryClient = useQueryClient()
  
  const { data: bases } = useQuery({
    queryKey: ['knowledge-bases'],
    queryFn: () => knowledgeApi.getBases().then(r => r.data),
  })
  
  return (
    <Box p={6}>
      <Heading mb={6}>知识库管理</Heading>
      
      <Tabs>
        <TabList>
          <Tab>知识库列表</Tab>
          <Tab>文档管理</Tab>
          <Tab>搜索测试</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <KnowledgeBaseList 
              bases={bases} 
              onSelect={setSelectedKb}
            />
          </TabPanel>
          <TabPanel>
            <DocumentManager knowledgeBase={selectedKb} />
          </TabPanel>
          <TabPanel>
            <SearchTestTool knowledgeBase={selectedKb} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}

// 知识库列表组件
function KnowledgeBaseList({ bases, onSelect }: { 
  bases?: KnowledgeBase[]
  onSelect: (kb: KnowledgeBase) => void 
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const queryClient = useQueryClient()
  
  const createMutation = useMutation({
    mutationFn: knowledgeApi.createBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      onClose()
    },
  })
  
  return (
    <Box>
      <Button leftIcon={<FiPlus />} onClick={onOpen} mb={4}>
        创建知识库
      </Button>
      
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>名称</Table.ColumnHeader>
            <Table.ColumnHeader>类型</Table.ColumnHeader>
            <Table.ColumnHeader>状态</Table.ColumnHeader>
            <Table.ColumnHeader>操作</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {bases?.map(kb => (
            <Table.Row key={kb.id} onClick={() => onSelect(kb)} cursor="pointer">
              <Table.Cell>
                <VStack align="start" gap={0}>
                  <Text fontWeight="bold">{kb.name}</Text>
                  <Text fontSize="xs" color="gray.500">{kb.description}</Text>
                </VStack>
              </Table.Cell>
              <Table.Cell>
                <Badge>{kb.type}</Badge>
              </Table.Cell>
              <Table.Cell>
                <Badge colorPalette={kb.status === 'active' ? 'green' : 'gray'}>
                  {kb.status}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <IconButton
                  aria-label="删除"
                  size="sm"
                  colorPalette="red"
                  variant="ghost"
                >
                  <FiTrash2 />
                </IconButton>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      
      {/* 创建对话框 */}
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Content>
          <Dialog.Header>创建知识库</Dialog.Header>
          <Dialog.Body>
            {/* 表单内容 */}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}

// 文档管理组件
function DocumentManager({ knowledgeBase }: { knowledgeBase: KnowledgeBase | null }) {
  const [file, setFile] = useState<File | null>(null)
  const queryClient = useQueryClient()
  
  const uploadMutation = useMutation({
    mutationFn: (file: File) => 
      knowledgeApi.uploadDocument(knowledgeBase!.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', knowledgeBase?.id] })
      setFile(null)
    },
  })
  
  if (!knowledgeBase) {
    return <Text color="gray.500">请先选择一个知识库</Text>
  }
  
  return (
    <Box>
      <HStack mb={4} gap={4}>
        <Input
          type="file"
          accept=".pdf,.docx,.md,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button
          leftIcon={<FiPlus />}
          disabled={!file}
          loading={uploadMutation.isPending}
          onClick={() => file && uploadMutation.mutate(file)}
        >
          上传文档
        </Button>
        <Button leftIcon={<FiRefreshCw />} variant="outline">
          同步文章
        </Button>
      </HStack>
      
      {/* 文档列表 */}
    </Box>
  )
}

// 搜索测试组件
function SearchTestTool({ knowledgeBase }: { knowledgeBase: KnowledgeBase | null }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  
  const handleSearch = async () => {
    if (!knowledgeBase || !query) return
    const res = await knowledgeApi.searchTest(knowledgeBase.id, query)
    setResults(res.data)
  }
  
  return (
    <Box>
      <HStack mb={4}>
        <Input
          placeholder="输入测试查询..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button leftIcon={<FiSearch />} onClick={handleSearch}>
          搜索
        </Button>
      </HStack>
      
      {/* 搜索结果 */}
    </Box>
  )
}
```

---

## 六、依赖配置

### 6.1 后端依赖 (pom.xml)
```xml
<!-- PDF 解析 -->
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox</artifactId>
    <version>3.0.1</version>
</dependency>

<!-- Word 解析 -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>

<!-- Apache Tika (通用文档解析) -->
<dependency>
    <groupId>org.apache.tika</groupId>
    <artifactId>tika-core</artifactId>
    <version>2.9.1</version>
</dependency>
```

---

## 七、实施步骤

### Phase 1: 数据库 (1天)
1. 创建知识库相关表
2. 添加 HNSW 索引
3. 数据迁移脚本

### Phase 2: 后端 (3天)
1. Entity 层
2. Repository 层
3. Service 层
4. Controller 层
5. 文档解析服务集成

### Phase 3: 前端 (3天)
1. API 封装
2. Hooks (语音功能)
3. AI 助手组件增强
4. 知识库管理页面

### Phase 4: 测试与优化 (2天)
1. 单元测试
2. 集成测试
3. 性能优化

---

**方案文档版本**: v1.0  
**创建日期**: 2026-03-20  
**文档路径**: `drafts/knowledge-base-ai-assistant-spec.md`
