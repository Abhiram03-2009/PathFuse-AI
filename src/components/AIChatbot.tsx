
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const AIChatbot = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI Career Coach. I can help you with resume tips, interview preparation, career advice, and job search strategies. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const predefinedQuestions = [
    "How do I write a compelling resume summary?",
    "What are common interview questions?",
    "How do I negotiate salary?",
    "Tips for remote job interviews?",
    "How to change careers successfully?",
    "What skills are in demand right now?"
  ];

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Career advice responses
    if (message.includes('resume') || message.includes('cv')) {
      return "For an effective resume: 1) Use a clean, ATS-friendly format 2) Include relevant keywords from job descriptions 3) Quantify achievements with specific numbers 4) Keep it concise (1-2 pages) 5) Use action verbs like 'managed', 'developed', 'increased' 6) Tailor each resume to the specific job you're applying for.";
    }
    
    if (message.includes('interview')) {
      return "Common interview questions and how to answer them: 1) 'Tell me about yourself' - Give a 2-minute professional summary 2) 'Why do you want this job?' - Show enthusiasm and research 3) 'What are your strengths?' - Pick 2-3 relevant strengths with examples 4) 'Where do you see yourself in 5 years?' - Show ambition aligned with the role 5) Always prepare questions to ask them back!";
    }
    
    if (message.includes('salary') || message.includes('negotiate')) {
      return "Salary negotiation tips: 1) Research market rates on sites like Glassdoor, PayScale 2) Know your worth - list your achievements and skills 3) Consider the entire package (benefits, PTO, remote work) 4) Practice your pitch beforehand 5) Be confident but respectful 6) Give a range rather than exact number 7) Don't accept immediately - ask for time to consider.";
    }
    
    if (message.includes('skills') || message.includes('demand')) {
      return "High-demand skills in 2024: Technical - Python, JavaScript, Cloud Computing (AWS/Azure), Data Analysis, Cybersecurity, AI/Machine Learning. Soft Skills - Leadership, Communication, Problem-solving, Adaptability, Emotional Intelligence. Industry-specific - Digital Marketing, UX/UI Design, Project Management, Sales, Healthcare. Focus on combining technical and soft skills!";
    }
    
    if (message.includes('remote') || message.includes('work from home')) {
      return "Remote work tips: 1) Create a dedicated workspace 2) Establish clear boundaries between work and personal time 3) Over-communicate with your team 4) Use video calls for important discussions 5) Take regular breaks and stay active 6) Invest in good lighting and audio for video calls 7) Build relationships with colleagues through virtual coffee chats.";
    }
    
    if (message.includes('career change') || message.includes('switch')) {
      return "Career change strategy: 1) Identify transferable skills from your current role 2) Network in your target industry 3) Consider informational interviews 4) Get relevant certifications or training 5) Start with side projects or volunteer work 6) Update your LinkedIn to reflect your new direction 7) Be patient - career transitions take time but are very achievable!";
    }
    
    if (message.includes('linkedin')) {
      return "LinkedIn optimization: 1) Professional headshot photo 2) Compelling headline beyond just job title 3) Summary that tells your story 4) Complete all sections (experience, education, skills) 5) Get recommendations from colleagues 6) Post regularly about industry topics 7) Engage with others' content 8) Join relevant groups 9) Use keywords for discoverability.";
    }
    
    if (message.includes('cover letter')) {
      return "Cover letter best practices: 1) Address to specific person when possible 2) Opening paragraph should grab attention 3) Show you've researched the company 4) Highlight 2-3 key achievements relevant to the role 5) Explain why you want THIS job at THIS company 6) Keep it concise (3-4 paragraphs) 7) Professional closing with call to action 8) Proofread carefully!";
    }
    
    // Default intelligent response
    return `That's a great question about ${message.includes('job') ? 'job searching' : 'career development'}! Based on current industry trends, I'd recommend focusing on continuous learning and networking. Consider: 1) Updating your skills regularly 2) Building meaningful professional relationships 3) Staying current with industry news 4) Seeking feedback and mentorship 5) Setting clear career goals. What specific aspect would you like me to elaborate on?`;
  };

  const sendMessage = async (message?: string) => {
    const messageText = message || inputMessage.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Generate intelligent AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuestionClick = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <MessageCircle className="w-5 h-5" />
            <span>AI Career Coach</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Get personalized career advice, interview tips, and job search strategies from your AI assistant.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Questions */}
        <Card className="lg:col-span-1 bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Quick Questions</CardTitle>
            <CardDescription className="text-gray-600">
              Click on a question to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {predefinedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full text-left justify-start text-wrap h-auto p-3 text-gray-800 border-gray-300 hover:bg-gray-50"
                onClick={() => handleQuestionClick(question)}
              >
                {question}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-3 bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
              <Bot className="w-5 h-5 text-blue-600" />
              <span>Chat with AI Coach</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-96">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'bot' && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about your career..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isTyping}
                  className="text-gray-900 border-gray-300"
                />
                <Button 
                  onClick={() => sendMessage()}
                  disabled={isTyping || !inputMessage.trim()}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIChatbot;
