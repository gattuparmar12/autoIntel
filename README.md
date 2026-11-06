# 🤖 AutoIntel — Autonomous Multi-Tool Research & Analytics Agent

AutoIntel is an advanced autonomous AI agent built using **Node.js** and the **@google/genai SDK**. It leverages agentic loops and multi-step reasoning to dynamically select and execute tools based on user prompts.

## 🚀 Key Features
- **Multi-Step Agentic Loop:** The agent autonomously reasons, calls tools, processes outputs, and decides when to finish tasks.
- **Integrated Tools:**
  - 📚 **Wikipedia Search:** Fetches real-time summaries and deep history.
  - 🪙 **Crypto Price Tracker:** Retrieves live cryptocurrency prices in USD.
  - 💱 **Currency Converter:** Converts amounts across global currencies dynamically.
  - 💾 **File System (`fs`):** Automatically saves generated research reports directly into `.md` or `.txt` files.
- **Chat History & Memory:** Maintains full conversational context across turns.

## 🛠️ Tech Stack
- **Language:** JavaScript (Node.js)
- **AI SDK:** `@google/genai`
- **Environment Management:** `dotenv`

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/gattuparmar12/autoIntel.git](https://github.com/gattuparmar12/autoIntel.git)
   cd AutoIntel