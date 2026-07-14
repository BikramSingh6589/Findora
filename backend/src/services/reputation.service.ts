import User from '../models/User';

export const addXP = async (userId: string, amount: number): Promise<void> => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.xp = (user.xp || 0) + amount;
    
    // Level Up calculation: 100 XP per level
    const newLevel = Math.floor(user.xp / 100) + 1;
    if (newLevel !== (user.level || 1)) {
      user.level = newLevel;
      // Award level up badge
      const levelBadge = `Level ${newLevel} Achiever`;
      if (!user.badges.includes(levelBadge)) {
        user.badges.push(levelBadge);
      }
    }

    // Assign specific milestone badges
    if (user.xp >= 100 && !user.badges.includes('Helper Bronze')) {
      user.badges.push('Helper Bronze');
    }
    if (user.xp >= 500 && !user.badges.includes('Helper Silver')) {
      user.badges.push('Helper Silver');
    }
    if (user.xp >= 1000 && !user.badges.includes('Helper Gold')) {
      user.badges.push('Helper Gold');
    }

    await user.save();
    console.log(`Reputation Service: Awarded ${amount} XP to user ${user.name}. New total: ${user.xp}`);
  } catch (error) {
    console.error('Reputation Service Error adding XP:', error);
  }
};
