---
"cyber-skills": patch
---

Add optional `home` parameter to `getLockPath`, `readLock`, `writeLock`, `setLockEntry`, `removeLockEntry`, and `getLockEntry` to allow overriding the home directory, preventing global-scope lock writes from leaking into `~/.agents` during tests.
