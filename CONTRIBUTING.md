# 🤝 Contributing to Asisten Wira

Terima kasih atas minat Anda untuk berkontribusi pada **Asisten Wira**! 🚀

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

---

## 📜 Code of Conduct

Proyek ini dan semua kontributornya diatur oleh [Code of Conduct](CODE_OF_CONDUCT.md). Dengan berpartisipasi, Anda diharapkan untuk mematuhi kode ini.

---

## 🤔 How Can I Contribute?

### 🐛 Bug Reports
- Gunakan template issue yang disediakan
- Jelaskan langkah-langkah reproduksi yang jelas
- Sertakan screenshots jika relevan
- Jelaskan perilaku yang diharapkan vs yang terjadi

### 💡 Feature Requests
- Jelaskan fitur yang diinginkan dan mengapa diperlukan
- Berikan contoh use case yang konkret
- Pertimbangkan dampak pada UMKM Indonesia

### 📝 Code Contributions
- Fork repository
- Buat branch untuk fitur baru
- Implementasikan perubahan
- Tambahkan tests jika relevan
- Submit pull request

### 📚 Documentation
- Perbaiki typo atau kesalahan
- Tambahkan contoh penggunaan
- Terjemahkan ke Bahasa Indonesia
- Buat tutorial atau guide

---

## 🛠️ Development Setup

### Prerequisites
```bash
# Frontend
Node.js 18+ & npm
# Backend  
Python 3.9+
# Database
Supabase account
```

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/asisten-wira.git
cd asisten-wira
```

### 2. Setup Frontend
```bash
cd frontend
npm install
cp env_template.txt .env.local
# Edit .env.local dengan credentials Anda
npm run dev
```

### 3. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env_template.txt .env
# Edit .env dengan credentials Anda
uvicorn main:app --reload --port 8000
```

### 4. Database Setup
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Buat project baru
3. Jalankan SQL dari `backend/database/schema_clean.sql`
4. Update environment variables

---

## 🔄 Pull Request Process

### 1. **Create Feature Branch**
```bash
git checkout -b feature/amazing-feature
# atau
git checkout -b fix/bug-description
```

### 2. **Make Changes**
- Implementasikan fitur/perbaikan
- Tambahkan tests jika relevan
- Update documentation
- Pastikan semua tests pass

### 3. **Commit Changes**
```bash
git add .
git commit -m "feat: add amazing feature for UMKM chatbot"
```

**Commit Message Format:**
```
type(scope): description

feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

### 4. **Push & Create PR**
```bash
git push origin feature/amazing-feature
```

### 5. **Pull Request Guidelines**
- **Title**: Jelaskan perubahan dengan jelas
- **Description**: 
  - Apa yang diubah dan mengapa
  - Screenshots jika ada UI changes
  - Test instructions
  - Checklist completion
- **Linked Issues**: Link ke issue yang relevan

---

## 📏 Code Style Guidelines

### Frontend (Next.js + TypeScript)
```typescript
// ✅ Good
interface ChatbotConfig {
  id: string;
  name: string;
  isActive: boolean;
}

const ChatbotCard: React.FC<{ config: ChatbotConfig }> = ({ config }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleActivate = async () => {
    setIsLoading(true);
    try {
      await activateChatbot(config.id);
    } catch (error) {
      console.error('Failed to activate chatbot:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold">{config.name}</h3>
      <button 
        onClick={handleActivate}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isLoading ? 'Activating...' : 'Activate'}
      </button>
    </div>
  );
};
```

### Backend (Python + FastAPI)
```python
# ✅ Good
from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import HTTPException, Depends

class ChatbotCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    industry: str = Field(..., min_length=1, max_length=50)

class ChatbotService:
    def __init__(self, db: Database):
        self.db = db
    
    async def create_chatbot(
        self, 
        chatbot_data: ChatbotCreate, 
        user_id: str
    ) -> Chatbot:
        try:
            chatbot = Chatbot(
                **chatbot_data.dict(),
                user_id=user_id,
                created_at=datetime.utcnow()
            )
            await self.db.add(chatbot)
            await self.db.commit()
            return chatbot
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to create chatbot: {str(e)}"
            )

@router.post("/chatbots", response_model=Chatbot)
async def create_chatbot(
    chatbot_data: ChatbotCreate,
    current_user: User = Depends(get_current_user),
    chatbot_service: ChatbotService = Depends(get_chatbot_service)
):
    return await chatbot_service.create_chatbot(
        chatbot_data, 
        current_user.id
    )
```

---

## 🐛 Reporting Bugs

### Bug Report Template
```markdown
## Bug Description
[Deskripsi singkat tentang bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
[Apa yang seharusnya terjadi]

## Actual Behavior
[Apa yang sebenarnya terjadi]

## Environment
- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 120.0]
- Frontend Version: [e.g. Next.js 14.0.0]
- Backend Version: [e.g. FastAPI 0.100.0]

## Additional Context
[Screenshot, logs, atau informasi tambahan]
```

---

## 💡 Suggesting Enhancements

### Enhancement Request Template
```markdown
## Problem Statement
[Deskripsi masalah yang ingin diselesaikan]

## Proposed Solution
[Solusi yang diusulkan]

## Alternative Solutions
[Alternatif lain yang sudah dipertimbangkan]

## Additional Context
[Informasi tambahan, use cases, dll]
```

---

## 🧪 Testing Guidelines

### Frontend Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Backend Testing
```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_chatbot_service.py
```

---

## 📚 Documentation Standards

### Code Comments
```typescript
// ✅ Good - Explain WHY, not WHAT
// Use IBM Orchestrate for premium users to ensure enterprise-grade responses
const aiProvider = user.tier === 'premium' ? 'ibm' : 'huggingface';

// ❌ Bad - Obvious from code
const aiProvider = user.tier === 'premium' ? 'ibm' : 'huggingface';
```

### README Updates
- Update README.md jika ada fitur baru
- Tambahkan screenshots untuk UI changes
- Update installation steps jika ada dependencies baru

---

## 🚀 Release Process

### Version Bumping
- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Release notes written
- [ ] Deployment successful

---

## 🙏 Recognition

Kontributor akan diakui dengan:
- **Contributors** section di README.md
- **GitHub Contributors** graph
- **Release notes** untuk fitur yang berkontribusi
- **Special thanks** untuk kontribusi signifikan

---

## 📞 Getting Help

- **GitHub Issues**: Untuk bug reports dan feature requests
- **GitHub Discussions**: Untuk pertanyaan dan diskusi
- **Email**: support@assistenwira.com (untuk urgent matters)

---

**Terima kasih telah berkontribusi untuk memberdayakan UMKM Indonesia! 🇮🇩🚀**
