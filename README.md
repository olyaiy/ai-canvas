# AI Agent Flow Builder

![AI Agent Flow Builder Interface](./public/ai%20canvas%20image.png)

A powerful visual flow builder for creating and managing AI agent workflows using Next.js 14, React Flow, and modern web technologies. This tool allows you to create, connect, and orchestrate conversations between different AI models (GPT and Claude) through an intuitive drag-and-drop interface.

## Features

- 🎨 Visual Flow Builder
  - Drag-and-drop interface for creating AI workflows
  - Real-time flow visualization
  - Animated connections between nodes
  - Customizable node configurations

- 🤖 AI Model Integration
  - GPT (OpenAI) integration
  - Claude (Anthropic) integration
  - Customizable system prompts
  - Adjustable model parameters (temperature, max tokens)

- 💾 Project Management
  - Save and load projects
  - Preview mode for shared workflows
  - Project deletion with confirmation
  - Automatic layout optimization

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Components**: 
  - React Flow for node-based interface
  - Shadcn UI for components
  - Tailwind CSS for styling
- **Language**: TypeScript
- **State Management**: React Hooks
- **Animations**: Custom edge animations

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/olyaiy/ai-canvas
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up your environment variables:
```env
# Create a .env.local file with:
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to start building flows.

## Usage

### Creating a New Flow

1. Use the buttons in the bottom-right corner to add nodes:
   - "New Prompt" - Add input prompts
   - "New GPT Agent" - Add OpenAI GPT nodes
   - "New Claude Agent" - Add Anthropic Claude nodes

2. Connect nodes by dragging from one node's handle to another

3. Configure nodes by clicking on them and adjusting their parameters

4. Save your flow using the "Save Project" button

### Node Types

- **Prompt Input Node**: Entry point for user prompts
- **GPT Node**: OpenAI's GPT model integration
- **Claude Node**: Anthropic's Claude model integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Your License Here]

## Support

For support, please create an issue in the repository.
