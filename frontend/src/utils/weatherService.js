/**
 * Rules Engine for analyzing if a task is affected by a given weather condition.
 * Maps exact keywords from the user request and returns customized AI warnings.
 */
export function analyzeTaskWeather(taskTitle, weatherStatus, temp = 25) {
  const title = (taskTitle || '').toLowerCase();
  const status = (weatherStatus || 'SUNNY').toUpperCase();

  // Tasks NOT affected by weather: study, coding, read, gaming, office work, etc.
  const nonAffectedKeywords = [
    'study', 'office work', 'read', 'book', 'coding', 'code', 'online meeting',
    'meeting', 'gaming', 'cook', 'cooking', 'laundry', 'dryer', 'yoga', 'gym',
    'workout', 'clean the house', 'clean house', 'movie', 'online shopping'
  ];

  // If the task title contains non-affected keywords, skip immediately
  const isNonAffected = nonAffectedKeywords.some(keyword => title.includes(keyword));
  if (isNonAffected) {
    return { isAffected: false, reason: '', suggestion: '' };
  }

  // Extreme heat check (e.g. temperature > 35°C)
  const isExtremeHeat = temp > 35;

  // Define rules mapping keywords to affected conditions and suggestions
  const rules = [
    {
      keywords: ['run', 'running', 'jog', 'jogging'],
      trigger: () => status === 'RAINY' || status === 'STORMY' || isExtremeHeat,
      reason: status === 'RAINY' || status === 'STORMY' ? 'Rain' : 'Extreme heat',
      suggestion: 'Reschedule or suggest indoor exercise'
    },
    {
      keywords: ['walk', 'walking'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Move to another time'
    },
    {
      keywords: ['bicycle', 'cycle', 'cycling', 'ride a bike', 'bike ride'],
      trigger: () => status === 'RAINY' || status === 'STORMY' || status === 'WINDY',
      reason: status === 'WINDY' ? 'Strong wind' : 'Rain',
      suggestion: 'Postpone'
    },
    {
      keywords: ['temple'],
      trigger: () => status === 'STORMY', // Heavy rain/thunderstorm
      reason: 'Heavy rain',
      suggestion: 'Suggest a different time'
    },
    {
      keywords: ['shopping', 'shop'],
      trigger: () => status === 'STORMY',
      reason: 'Heavy rain',
      suggestion: 'Delay or recommend online shopping'
    },
    {
      keywords: ['wash the car', 'wash car', 'car wash'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Postpone'
    },
    {
      keywords: ['dry clothes', 'drying clothes', 'clothes outside'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Dry indoors'
    },
    {
      keywords: ['water the plants', 'water plants', 'watering plants'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Skip watering'
    },
    {
      keywords: ['gardening', 'garden'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Reschedule'
    },
    {
      keywords: ['walk the dog', 'dog walk'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Shorten or delay the walk'
    },
    {
      keywords: ['beach'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain or storm',
      suggestion: 'Cancel or reschedule'
    },
    {
      keywords: ['fishing', 'fish'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain or storm',
      suggestion: 'Postpone'
    },
    {
      keywords: ['outdoor photography', 'photography', 'photo shoot'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Move indoors or reschedule'
    },
    {
      keywords: ['outdoor event', 'attend event'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Check if moved indoors'
    },
    {
      keywords: ['bbq', 'barbecue'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Move indoors or postpone'
    },
    {
      keywords: ['picnic'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Choose another day'
    },
    {
      keywords: ['football'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Reschedule'
    },
    {
      keywords: ['cricket'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Postpone'
    },
    {
      keywords: ['tennis'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Use an indoor court if available'
    },
    {
      keywords: ['badminton'],
      trigger: () => status === 'RAINY' || status === 'STORMY' || status === 'WINDY',
      reason: status === 'WINDY' ? 'Wind' : 'Rain',
      suggestion: 'Move indoors'
    },
    {
      keywords: ['drive', 'travel', 'trip'],
      trigger: () => status === 'STORMY',
      reason: 'Heavy rain or storm',
      suggestion: 'Delay travel to avoid flooding'
    },
    {
      keywords: ['walk to work'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Leave earlier or use transport'
    },
    {
      keywords: ['cycle to work'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Use public transport'
    },
    {
      keywords: ['clean the yard', 'yard clean', 'clean yard'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Wait for dry weather'
    },
    {
      keywords: ['take out the trash', 'take trash', 'trash'],
      trigger: () => status === 'STORMY',
      reason: 'Heavy rain',
      suggestion: 'Wait if possible'
    },
    {
      keywords: ['balcony', 'clean the balcony'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Reschedule'
    },
    {
      keywords: ['shoot a video', 'shoot video'],
      trigger: () => status === 'RAINY' || status === 'STORMY',
      reason: 'Rain',
      suggestion: 'Move indoors'
    }
  ];

  // Find a matching rule
  for (const rule of rules) {
    const isMatch = rule.keywords.some(keyword => title.includes(keyword));
    if (isMatch && rule.trigger()) {
      return {
        isAffected: true,
        reason: rule.reason,
        suggestion: rule.suggestion
      };
    }
  }

  return { isAffected: false, reason: '', suggestion: '' };
}
