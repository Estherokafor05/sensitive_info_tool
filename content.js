function showWarningBanner(message) {
  if (document.getElementById("qa-sensitive-banner")) return;
  
  const banner = document.createElement("div");
  banner.id = "qa-sensitive-banner";
  
  // Create banner content
  banner.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
      <span style="font-size: 20px;">⚠️</span>
      <span>${message}</span>
    </div>
  `;
  
  // Style the banner
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: #ff4444;
    color: #fff;
    padding: 12px;
    text-align: center;
    z-index: 10000;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-size: 14px;
    animation: slideDown 0.3s ease-out;
  `;
  
  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from { transform: translateY(-100%); }
      to { transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(banner);
  setTimeout(() => {
    banner.style.animation = 'slideUp 0.3s ease-out';
    style.textContent += `
      @keyframes slideUp {
        from { transform: translateY(0); }
        to { transform: translateY(-100%); }
      }
    `;
    setTimeout(() => banner.remove(), 300);
  }, 8000);
}

function containsSensitiveInfo(text) {
  const patterns = [
    // API Keys and Tokens
    /aws[_-]?secret[_-]?key/i,
    /api[_-]?key/i,
    /token[\s:=]/i,
    /authorization[:=]/i,
    /bearer\s+[a-z0-9]/i,
    /openai[_-]?api[_-]?key/i,
    /anthropic[_-]?api[_-]?key/i,
    /google[_-]?api[_-]?key/i,
    /claude[_-]?api[_-]?key/i,
    /gpt[_-]?api[_-]?key/i,
    /azure[_-]?api[_-]?key/i,
    /huggingface[_-]?api[_-]?key/i,
    /stability[_-]?api[_-]?key/i,
    /midjourney[_-]?api[_-]?key/i,
    
    // Credentials
    /password[\s:=]/i,
    /secret[\s:=]/i,
    /credential[\s:=]/i,
    /passwd[\s:=]/i,
    /pwd[\s:=]/i,
    
    // Personal Information
    /\b\d{19,20}\b/, // Credit card numbers
    /\b\d{3}-?\d{2}-?\d{4}\b/, // SSN
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email addresses
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
    /\b[A-Z]{2}\d{2}[A-Z]{2}\d{4}\b/, // Vehicle registration numbers
    
    // Access Tokens
    /access[_-]?token/i,
    /private[_-]?key/i,
    /ssh[_-]?key/i,
    /oauth[_-]?token/i,
    /jwt[_-]?token/i,
    /refresh[_-]?token/i,
    
    // Common AI-specific patterns
    /model[_-]?key/i,
    /embedding[_-]?key/i,
    /completion[_-]?key/i,
    /organization[_-]?id/i,
    /project[_-]?id/i,
    /deployment[_-]?id/i,
    
    // Common AI Service Patterns
    /sk-[a-zA-Z0-9]{32,}/i, // OpenAI-style keys
    /sk_live_[a-zA-Z0-9]{32,}/i, // Stripe-style keys
    /[a-zA-Z0-9]{32,}/i, // Generic long keys
    
    // Additional Security Patterns
    /private[_-]?key/i,
    /public[_-]?key/i,
    /certificate/i,
    /pem[_-]?file/i,
    /keystore/i,
    /truststore/i,
    
    // Database Credentials
    /db[_-]?password/i,
    /database[_-]?password/i,
    /db[_-]?user/i,
    /database[_-]?user/i,
    /connection[_-]?string/i,
    
    // Cloud Service Credentials
    /aws[_-]?access[_-]?key/i,
    /aws[_-]?secret[_-]?key/i,
    /azure[_-]?connection[_-]?string/i,
    /gcp[_-]?credentials/i,
    /google[_-]?cloud[_-]?key/i,
    
    // Payment Information
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card numbers with spaces/dashes
    /\b\d{3}[- ]?\d{3}[- ]?\d{3}[- ]?\d{3}\b/, // Debit card numbers
    /cvv[\s:=]/i,
    /security[_-]?code/i,
    /expiry[_-]?date/i,
    
    // Authentication
    /auth[_-]?token/i,
    /session[_-]?id/i,
    /cookie[_-]?token/i,
    /jwt[_-]?secret/i,
    
    // Common Secret Patterns
    /secret[_-]?key/i,
    /encryption[_-]?key/i,
    /decryption[_-]?key/i,
    /signing[_-]?key/i,
    
    // Environment Variables
    /env[_-]?var/i,
    /environment[_-]?variable/i,
    /\.env/i,
    
    // Common File Extensions for Sensitive Data
    /\.pem$/i,
    /\.key$/i,
    /\.crt$/i,
    /\.cer$/i,
    /\.p12$/i,
    /\.pfx$/i,
    
    // Common Secret Patterns in Code
    /config[_-]?secret/i,
    /app[_-]?secret/i,
    /client[_-]?secret/i,
    /server[_-]?secret/i
  ];
  
  // Check for common password patterns
  const passwordPatterns = [
    /password[\s:=][^\s]{8,}/i, // Passwords with length >= 8
    /passwd[\s:=][^\s]{8,}/i,
    /pwd[\s:=][^\s]{8,}/i
  ];
  
  // Check for API key patterns
  const apiKeyPatterns = [
    /[a-zA-Z0-9]{32,}/, // Generic long keys
    /[a-zA-Z0-9_-]{32,}/, // Keys with underscores and dashes
    /[a-zA-Z0-9]{24,}/, // Shorter keys
    /[a-zA-Z0-9_-]{24,}/ // Shorter keys with underscores and dashes
  ];
  
  // Check for credit card patterns with Luhn algorithm validation
  const creditCardPattern = /\b(?:\d[ -]*?){13,19}\b/;
  const hasCreditCard = creditCardPattern.test(text);
  
  if (hasCreditCard) {
    const digits = text.replace(/\D/g, '');
    if (digits.length >= 13 && digits.length <= 19) {
      let sum = 0;
      let isEven = false;
      for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i]);
        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        sum += digit;
        isEven = !isEven;
      }
      if (sum % 10 === 0) {
        return true;
      }
    }
  }
  
  return patterns.some((regex) => regex.test(text)) ||
         passwordPatterns.some((regex) => regex.test(text)) ||
         apiKeyPatterns.some((regex) => regex.test(text));
}

function isAIChatInterface(element) {
  // Common AI chat interface selectors
  const aiSelectors = [
    // ChatGPT
    '[data-message-author-role="user"]',
    '[data-message-author-role="assistant"]',
    // Claude
    '.claude-chat',
    '.claude-message',
    // Bard/Gemini
    '.bard-chat',
    '.gemini-chat',
    // Generic AI chat patterns
    '[role="textbox"]',
    '[contenteditable="true"]',
    '.chat-input',
    '.message-input',
    '.prompt-input',
    // Common AI app classes
    '.ai-chat',
    '.chat-interface',
    '.conversation-input',
    // Specific AI apps
    '.perplexity-chat',
    '.poe-chat',
    '.character-ai-chat',
    '.anthropic-chat',
    '.huggingface-chat'
  ];

  return aiSelectors.some(selector => {
    return element.matches(selector) || element.closest(selector);
  });
}

function monitorInputs() {
  // Monitor input events
  document.addEventListener("input", (event) => {
    const el = event.target;
    if (
      el &&
      (
        el.tagName === "TEXTAREA" ||
        el.tagName === "INPUT" ||
        el.isContentEditable ||
        el.getAttribute("contenteditable") === "true" ||
        isAIChatInterface(el)
      )
    ) {
      const value = el.value || el.innerText;
      if (containsSensitiveInfo(value)) {
        showWarningBanner("⚠️ Warning: Potential sensitive information detected while typing. Please review before sending.");
      }
    }
  });

  // Monitor paste events
  document.addEventListener("paste", (event) => {
    const el = event.target;
    if (el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT" || el.isContentEditable || isAIChatInterface(el))) {
      const pastedText = event.clipboardData.getData('text');
      if (containsSensitiveInfo(pastedText)) {
        showWarningBanner("⚠️ Warning: Potential sensitive information detected in pasted content.");
      }
    }
  });
}

// Start monitoring when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', monitorInputs);
} else {
  monitorInputs();
}
