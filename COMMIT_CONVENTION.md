# Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) to standardize commit messages.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

## Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

## Examples

### Feature
```
feat: add user registration
```

### Bug Fix
```
fix: resolve login validation failure
```

### Documentation
```
docs: update README file
```

### Refactoring
```
refactor: restructure authentication module
```

### Testing
```
test: add unit tests for user service
```

### Scoped Commit
```
feat(auth): implement social login
```

### Commit with Body
```
fix(database): resolve database connection timeout

Add retry logic and timeout handling to prevent connection failures in unstable networks.
Fixes issue #123.
```

## Commit Message Validation

Before committing, the system automatically checks if your commit message follows the convention.
If it doesn't, the commit will be rejected, and you'll need to modify the message before trying again.

---

# 提交信息规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范来标准化提交信息。

## 提交信息格式

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

## 允许的类型

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档变更
- `style`: 代码风格变更(不影响代码运行的变动)
- `refactor`: 代码重构(既不是新增功能，也不是修改bug的代码变动)
- `perf`: 性能优化
- `test`: 增加测试
- `build`: 构建过程或辅助工具的变动
- `ci`: 持续集成相关文件和脚本的改动
- `chore`: 其它修改(不在上述类型中的修改)
- `revert`: 回滚到上一个版本

## 示例

### 新功能
```
feat: 添加用户注册功能
```

### 修复错误
```
fix: 修复登录验证失败的问题
```

### 文档变更
```
docs: 更新README文件
```

### 重构代码
```
refactor: 重构认证模块
```

### 添加测试
```
test: 为用户服务添加单元测试
```

### 带作用域的提交
```
feat(auth): 添加社交登录功能
```

### 带详细描述的提交
```
fix(database): 修复数据库连接超时问题

增加重试逻辑和超时处理，防止在网络不稳定情况下的连接失败。
修复问题 #123。
```

## 提交信息检查

提交前，系统会自动检查您的提交信息是否符合规范。
如果不符合规范，提交将被拒绝，您需要修改提交信息后重新提交。 