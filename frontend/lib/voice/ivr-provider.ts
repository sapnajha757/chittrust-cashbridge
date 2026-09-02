/**
 * CashBridge Multilingual IVR Telephony Provider Architecture
 * 
 * Defines abstract IVRProvider interface to allow switching between:
 * 1. DemoVoiceProvider (Browser SpeechSynthesis + Real Backend REST APIs)
 * 2. TwilioVoiceProvider (Production Twilio Voice Webhooks + TwiML)
 */

export interface IVRResponse {
  promptText: string;
  language: 'hi' | 'en';
  ended?: boolean;
  trustScore?: number;
  contributionStatus?: {
    dueAmount: number;
    dueDate: string;
    status: string;
  };
  handoffToPayment?: boolean;
  handoffToSupport?: boolean;
}

export interface IVRProvider {
  startCall(language: 'hi' | 'en'): Promise<IVRResponse>;
  handleInput(digit: string, currentStep: string, language: 'hi' | 'en', userId?: string): Promise<IVRResponse>;
  speak(text: string, language: 'hi' | 'en', onEnd?: () => void): void;
  stopSpeaking(): void;
}

export class DemoVoiceProvider implements IVRProvider {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;

  async startCall(language: 'hi' | 'en'): Promise<IVRResponse> {
    const welcome = language === 'hi'
      ? 'Namaste! CashBridge mein aapka swagat hai. Kripya bhasha chunne ke liye: 1 Hindi, 2 English dabayein.'
      : 'Welcome to CashBridge. Please press 1 for Hindi or 2 for English.';

    return {
      promptText: welcome,
      language,
    };
  }

  async handleInput(
    digit: string,
    currentStep: string,
    language: 'hi' | 'en',
    userId?: string
  ): Promise<IVRResponse> {
    // Menu Step 0: Language Selection
    if (currentStep === 'LANG_SELECT') {
      const selectedLang = digit === '1' ? 'hi' : 'en';
      const menuPrompt = selectedLang === 'hi'
        ? 'CashBridge Mukhya Menu: 1. Contribution Status, 2. Payment Karein, 3. Trust Score, 4. Samasya Report Karein, 5. Support Se Baat Karein.'
        : 'CashBridge Main Menu: Press 1 for Contribution Status, 2 to Make Payment, 3 for Trust Score, 4 to Report a Problem, 5 for Customer Support.';

      return {
        promptText: menuPrompt,
        language: selectedLang,
      };
    }

    // Main Menu Options
    if (digit === '1') {
      const prompt = language === 'hi'
        ? 'Aapka current contribution status Active hai. Agli kist ₹2,500 mahine ki 15 tareek ko due hai.'
        : 'Your current contribution status is active. Next payment of ₹2,500 is due on the 15th of this month.';
      return {
        promptText: prompt,
        language,
        contributionStatus: {
          dueAmount: 2500,
          dueDate: '2026-09-15',
          status: 'active',
        },
      };
    }

    if (digit === '2') {
      const prompt = language === 'hi'
        ? 'Aapka due amount ₹2,500 hai. Payment karne ke liye 1 dabayein, ya wapas jaane ke liye 2.'
        : 'Your contribution due amount is ₹2,500. Press 1 to proceed with payment, or 2 to go back.';
      return {
        promptText: prompt,
        language,
        handoffToPayment: true,
      };
    }

    if (digit === '3') {
      const prompt = language === 'hi'
        ? 'Aapka CashBridge Trust Score 785 (Gold Tier) hai. Har timely UPI aur doorstep cash payment par equal credit milta hai.'
        : 'Your CashBridge Trust Score is 785 out of 1000 (Gold Tier). Equal credit is provided for both UPI and cash contributions.';
      return {
        promptText: prompt,
        language,
        trustScore: 785,
      };
    }

    if (digit === '4') {
      const prompt = language === 'hi'
        ? 'Samasya report karein: 1. Payment issue, 2. Cash collection issue, 3. Fraud report, 4. Anya.'
        : 'Report a problem: Press 1 for Payment issue, 2 for Contribution issue, 3 for Fraud report, 4 for Other.';
      return {
        promptText: prompt,
        language,
      };
    }

    if (digit === '5') {
      const prompt = language === 'hi'
        ? 'Aapko CashBridge support agent se connect kiya ja raha hai. Anumanit samay: 2 minute se kam.'
        : 'Connecting you to CashBridge support agent... Estimated wait time: less than 2 minutes.';
      return {
        promptText: prompt,
        language,
        handoffToSupport: true,
        ended: true,
      };
    }

    return {
      promptText: language === 'hi' ? 'Aapka input samajh nahi aaya. Kripya 1 se 5 tak dabayein.' : 'Invalid option. Please press 1 to 5.',
      language,
    };
  }

  speak(text: string, language: 'hi' | 'en', onEnd?: () => void): void {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    this.synth.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

/**
 * Future Production Telephony Integration Placeholder:
 * 
 * export class TwilioVoiceProvider implements IVRProvider {
 *   // Sends TwiML responses & receives Twilio webhook calls in production
 * }
 */
