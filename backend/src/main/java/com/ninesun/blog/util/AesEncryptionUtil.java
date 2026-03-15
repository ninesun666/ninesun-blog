package com.ninesun.blog.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256-GCM 加密工具类
 * 用于加密存储 OAuth Token 等敏感信息
 */
@Component
@Slf4j
public class AesEncryptionUtil {
    
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96 bits IV for GCM
    private static final int GCM_TAG_LENGTH = 128; // 128 bits authentication tag
    
    @Value("${app.encryption.key:}")
    private String encryptionKey;
    
    /**
     * 加密明文
     * @param plainText 明文
     * @return Base64 编码的密文 (IV + ciphertext)
     */
    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        
        if (encryptionKey == null || encryptionKey.isEmpty()) {
            log.warn("Encryption key not configured, storing plain text");
            return plainText;
        }
        
        try {
            byte[] keyBytes = getKeyBytes();
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
            
            // 生成随机 IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);
            
            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            
            // 将 IV 和密文合并
            byte[] cipherTextWithIv = new byte[GCM_IV_LENGTH + cipherText.length];
            System.arraycopy(iv, 0, cipherTextWithIv, 0, GCM_IV_LENGTH);
            System.arraycopy(cipherText, 0, cipherTextWithIv, GCM_IV_LENGTH, cipherText.length);
            
            return Base64.getEncoder().encodeToString(cipherTextWithIv);
        } catch (Exception e) {
            log.error("Encryption failed", e);
            throw new RuntimeException("Encryption failed", e);
        }
    }
    
    /**
     * 解密密文
     * @param cipherText Base64 编码的密文 (IV + ciphertext)
     * @return 明文
     */
    public String decrypt(String cipherText) {
        if (cipherText == null || cipherText.isEmpty()) {
            return cipherText;
        }
        
        if (encryptionKey == null || encryptionKey.isEmpty()) {
            log.warn("Encryption key not configured, returning as plain text");
            return cipherText;
        }
        
        try {
            byte[] keyBytes = getKeyBytes();
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
            
            byte[] decoded = Base64.getDecoder().decode(cipherText);
            
            // 提取 IV 和密文
            byte[] iv = new byte[GCM_IV_LENGTH];
            byte[] encryptedBytes = new byte[decoded.length - GCM_IV_LENGTH];
            System.arraycopy(decoded, 0, iv, 0, GCM_IV_LENGTH);
            System.arraycopy(decoded, GCM_IV_LENGTH, encryptedBytes, 0, encryptedBytes.length);
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);
            
            byte[] plainText = cipher.doFinal(encryptedBytes);
            return new String(plainText, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Decryption failed", e);
            throw new RuntimeException("Decryption failed", e);
        }
    }
    
    /**
     * 获取 32 字节密钥
     */
    private byte[] getKeyBytes() {
        byte[] keyBytes = encryptionKey.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            // 如果密钥不足 32 字节，用 0 填充
            byte[] paddedKey = new byte[32];
            System.arraycopy(keyBytes, 0, paddedKey, 0, keyBytes.length);
            keyBytes = paddedKey;
        } else if (keyBytes.length > 32) {
            // 如果密钥超过 32 字节，截取前 32 字节
            byte[] truncatedKey = new byte[32];
            System.arraycopy(keyBytes, 0, truncatedKey, 0, 32);
            keyBytes = truncatedKey;
        }
        return keyBytes;
    }
}
