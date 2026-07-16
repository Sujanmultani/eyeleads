import express from 'express';
import axios from 'axios';
import { storeSettings } from './settings.js';

const router = express.Router();

// @desc    Analyze customer inputs and return frame advisor recommendations
// @route   POST /api/ai/chat
// @access  Public
router.post('/chat', async (req, res, next) => {
  const { messages } = req.body;

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Graceful fallback to premium simulated rule-based frame finder if API key is absent
    const isMockKey = !apiKey || apiKey.includes('your_');
    if (isMockKey) {
      const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      
      let responseContent = `I'd love to help you find the perfect frames! Tell me a bit about your face shape (e.g. round, square, oval), your style preference, or the occasion you are shopping for! - Your luxury advisor at ${storeSettings.storeName} 👓`;
      
      if (userMessage.includes('round') || userMessage.includes('circle')) {
        responseContent = `For a round face shape, structure is key! I highly recommend our **Square** or **Rectangle** frames in hand-polished **Acetate**. They add sharp angles that balance your features beautifully. Check out our **Eyeglasses** category to browse at ${storeSettings.storeName}!`;
      } else if (userMessage.includes('square') || userMessage.includes('angular')) {
        responseContent = `To soften square or angular face shapes, round silhouettes work wonders! I recommend our pure **Titanium Round** frames or classic **Aviators** to add gentle curves. Take a look at our **Sunglasses** category to explore at ${storeSettings.storeName}!`;
      } else if (userMessage.includes('oval') || userMessage.includes('egg')) {
        responseContent = `An oval face is highly versatile! You can pull off almost any style, but our bold **Wayfarers** or sleek **Rectangles** in flexible TR90 are particular favorites for daily wear. Browse our **Computer Glasses** category at ${storeSettings.storeName}!`;
      } else if (userMessage.includes('computer') || userMessage.includes('blue') || userMessage.includes('screen') || userMessage.includes('work')) {
        responseContent = `For heavy screen use, protection and comfort are essential. I recommend our ultra-lightweight **Rectangle** TR90 frames with specialized blue-shield lenses (premium coating only +₹${storeSettings.blueCutPremium}) to block digital eye fatigue. Browse our **Computer Glasses** category!`;
      } else if (userMessage.includes('sport') || userMessage.includes('run') || userMessage.includes('cycle') || userMessage.includes('active')) {
        responseContent = `For active days, you need grip and flexibility! I recommend our high-impact **TR90 Sports Frames** with polarized sunglasses for anti-slip performance and clarity. Browse our **Sports** category at ${storeSettings.storeName}!`;
      } else if (userMessage.includes('kid') || userMessage.includes('child')) {
        responseContent = `For kids, play-proof durability is number one! I recommend our colorful **FlexiKids Round** frames made from shatterproof, flexible TR90. Browse our **Kids** category at ${storeSettings.storeName}!`;
      } else if (userMessage.includes('budget') || userMessage.includes('cheap') || userMessage.includes('price')) {
        responseContent = `We have wonderful choices starting at just ₹1,299! I recommend our **Digital Shield Pro** computer glasses or **FlexiKids Play** TR90 collections for great value. Check out our **All Frames** list in the Shop!`;
      } else if (userMessage.length > 0) {
        responseContent = `That sounds wonderful! Based on that, I recommend trying our lightweight **Japanese Titanium** rectangle frames for a sleek look, or bold **Italian Wayfarers** for a modern statement. Why not start by browsing our **Sunglasses** collections at ${storeSettings.storeName}?`;
      }

      // Add a slight artificial delay to simulate AI thinking
      await new Promise(resolve => setTimeout(resolve, 800));

      return res.json({
        status: 'success',
        content: responseContent
      });
    }

    // FIXED: Invalid Claude AI model string in ai.js
    let selectedModel = 'claude-sonnet-4-6';
    if (storeSettings.activeAIModel === 'Claude 3 Opus') {
      selectedModel = 'claude-3-opus-20240229';
    } else if (storeSettings.activeAIModel === 'Gemini 1.5 Pro') {
      selectedModel = 'gemini-1.5-pro-latest';
    } else if (storeSettings.activeAIModel === 'GPT-4o Omniscience') {
      selectedModel = 'gpt-4o';
    }

    // Secure server-side call to Anthropic API using the configured model
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: selectedModel,
        max_tokens: 300,
        system: `You are ${storeSettings.storeName}'s friendly frame advisor. ${storeSettings.storeName} sells: Eyeglasses, Sunglasses, Computer Glasses, Sports Frames, Kids Eyewear. Frame shapes available: Round, Square, Aviator, Cat-Eye, Wayfarer, Rectangle, Oval. Materials: Acetate, Titanium, TR90, Metal. When customer describes their face shape, style preference, budget, or occasion — recommend 2-3 specific frame types with brief reasons. Keep responses under 80 words. Be friendly and conversational. Always end with a specific category to browse. Support desk contact is ${storeSettings.supportEmail}.`,
        messages: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    const reply = response.data.content[0]?.text || "I'm sorry, I couldn't process that.";
    res.json({
      status: 'success',
      content: reply
    });
  } catch (error) {
    console.error('Anthropic API Error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to communicate with AI frame advisor',
      details: error.response?.data || error.message
    });
  }
});

export default router;
