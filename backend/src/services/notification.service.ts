import Notification from '../models/Notification';

export const createNotification = async (
  recipientId: string,
  type: string,
  title: string,
  message: string,
  relatedItemId?: string
): Promise<any> => {
  try {
    const notif = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedItemId: relatedItemId || null,
    });
    console.log(`Notification Service: Notification created for user ${recipientId}: "${title}"`);
    return notif;
  } catch (error) {
    console.error('Notification Service Error:', error);
    return null;
  }
};
