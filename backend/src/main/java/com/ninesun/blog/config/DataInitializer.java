package com.ninesun.blog.config;

import com.ninesun.blog.entity.User;
import com.ninesun.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // 检查是否已存在管理员账户
        if (userRepository.existsByUsername("admin")) {
            log.info("管理员账户已存在，跳过初始化");
            return;
        }

        // 创建默认管理员账户
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@ninesun.blog");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setNickname("管理员");
        admin.setRole(User.UserRole.ADMIN);
        admin.setEnabled(true);

        userRepository.save(admin);
        log.info("✅ 默认管理员账户创建成功！");
        log.info("   用户名: admin");
        log.info("   密码: admin123");
        log.info("   请登录后立即修改密码！");
    }
}
