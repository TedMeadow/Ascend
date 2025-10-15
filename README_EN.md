# 🏔️ Ascend

**Your Personal Dashboard for Life's Climb.**

Tired of rigid, corporate productivity tools that force you to work *their* way? Ascend takes a different path. It's not just another task manager; it's your personal, customizable dashboard for orchestrating your life.

The philosophy behind Ascend is simple: your tools should adapt to you, not the other way around. For anyone striving to bring order to chaos, the journey feels like a mountain ascent. Ascend is designed to be your personal base camp, your multi-tool, and your trusted compass on that journey.


[![License](https://img.shields.io/github/license/TedMeadow/Ascend?style=for-the-badge)](./LICENSE)
[![Python Version](https://img.shields.io/badge/python-3.11+-blue.svg?style=for-the-badge&logo=python)](https://www.python.org/downloads/)
[![Framework](https://img.shields.io/badge/FastAPI-0.119-05998b.svg?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)

---

## ✨ The Ascend Philosophy

*   **More Than a To-Do List.** We go beyond a simple checklist. Ascend aims to be your personal "multi-tool," integrating the utilities you actually need—from a Pomodoro timer and a music player to handy coding tools.

*   **Your Personal Hub.** Forget switching between a dozen apps. Ascend is built to be a central hub for life's different contexts: managing your finances, reading your books, tracking personal projects, and much more.

*   **True Modularity.** This is the core principle. Don't need a finance tracker? Turn it off. Want to add your city's subway map to your dashboard? In the future, you can. Ascend is being built as an ecosystem where **you choose** the modules you need, creating the perfect workspace for yourself.

## 🚀 Current Features

*   **A robust API core** built with FastAPI and SQLModel.
*   **Flexible authentication system** (Email/password + OAuth2).
*   **Secure storage** for secrets and API keys.
*   **Task Management Module** with full CRUD functionality.
*   **Comprehensive test coverage** for all implemented features.

## 🗺️ Vision & Roadmap: The Modules of Your Dashboard

The future of Ascend is a constantly growing collection of modules that you can enable as you see fit.

*   [ ] **💡 Idea Box:** A single place for your ideas, thoughts, and notes.
*   [ ] **💰 Wallet:** A financial assistant to track income, expenses, and savings.
*   [ ] **💻 Code Time:** Integration with GitHub/GitLab (including self-hosted instances) to track your coding activity.
*   [ ] **📚 Library:** Your personal digital library for storing and reading books (PDF, ePub).
*   [ ] **🎵 Music:** A module for playing music, potentially with streaming service integrations.
*   [ ] **🗓️ Calendar:** A powerful, Exchange-style calendar for planning your events and appointments.
*   [ ] **🍅 Pomodoro & Focus Tools:** Built-in timers and utilities for deep work sessions.
*   [ ] **⚙️ Utilities:** Useful small tools, like a currency converter, that should always be at your fingertips.

...and much more. **The ultimate goal is to give the user complete control over their personal toolkit.**

## 🛠️ Tech Stack

*   **Backend (This Repository):**
    *   **Framework:** [**FastAPI**](https://fastapi.tiangolo.com/)
    *   **ORM & Validation:** [**SQLModel**](https://sqlmodel.tiangolo.com/) (Pydantic + SQLAlchemy)
    *   **DB Migrations:** [**Alembic**](https://alembic.sqlalchemy.org/en/latest/)
    *   **Testing:** [**Pytest**](https://docs.pytest.org/en/7.1.x/)
*   **Frontend (Planned):**
    *   **Framework:** [**Next.js**](https://nextjs.org/)
    *   **Language:** TypeScript

## 🚀 Getting Started

### Prerequisites

*   Python 3.11+
*   Pip for dependency management
*   Docker & Docker Compose (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/TedMeadow/Ascend.git
cd Ascend/backend
```

### 2. Set Up the Environment

1.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # For Linux/macOS
    # venv\Scripts\activate    # For Windows
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Create a `.env` file** in the `backend/` directory. You can copy `.env.example` (if it exists) or create it from scratch.

    **.env**
    ```env
    DB_PATH="sqlite:///./database.db"
    DEBUG=True

    # Generate with: from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())
    ENCRYPTION_KEY="your-strong-encryption-key"

    # Generate with: import secrets; secrets.token_hex(32)
    SECRET_KEY="your-32-byte-secret-key-for-jwt"
    
    JWT_ALGORITHM="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES=60
    TIMEZONE="UTC"
    ```

### 3. Database & Launch

1.  **Apply database migrations:**
    ```bash
    alembic upgrade head
    ```

2.  **Run the server:**
    ```bash
    uvicorn src.main:app --reload
    ```
    The API and documentation will be available at `http://127.0.0.1:8000/docs`.

---

## 🐳 Running with Docker

This is the easiest way to get the project and its dependencies running.

1.  Ensure you have a configured `.env` file in the `backend/` directory.
2.  From the project's root directory, run:
    ```bash
    docker-compose up --build
    ```

## 🧪 Running Tests

To run the complete test suite, execute the following command from the `backend/` directory:
```bash
pytest
```

## 🤝 Contributing

Ascend is a project born from a personal need, and I welcome anyone who shares a similar vision. If you want to contribute, fix a bug, or suggest an idea for a new module, feel free to create an `issue` or `pull request`.

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📜 License

This project is distributed under the MIT License. See `LICENSE` for more information.