$ErrorActionPreference = "Stop"

Write-Host "1. 获取管理员 Token..."
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8089/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
$token = $loginResponse.token
Write-Host "成功获取 Token (头部: $($token.Substring(0, 15))...)"

Write-Host "`n2. 触发全量文章向量化 (Embeddings Generate)..."
$headers = @{
    "Authorization" = "Bearer $token"
}
$embedResponse = Invoke-RestMethod -Uri "http://localhost:8089/api/ai/embeddings/generate" -Method Post -Headers $headers
Write-Host "向量化状态: $($embedResponse.success)"
Write-Host "结果信息: $($embedResponse.message)"

Write-Host "`n3. 测试 AI Chat 聊天接口..."
$chatBody = @{
    message = "博客是如何部署的？"
    history = ""
} | ConvertTo-Json
$chatResponse = Invoke-RestMethod -Uri "http://localhost:8089/api/ai/chat" -Method Post -ContentType "application/json" -Body $chatBody
Write-Host "Chat 请求是否成功: $($chatResponse.success)"
Write-Host "AI 回复:`n$($chatResponse.response)"
Write-Host "`n参考了以下相关文章片段 (Sources):"
$chatResponse.sources | ForEach-Object {
    Write-Host "- ID: $($_.id) Title: $($_.title)"
}

Write-Host "`n测试完毕！"
