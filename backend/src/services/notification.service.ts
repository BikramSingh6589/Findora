import Notification from '../models/Notification';
import { getIO } from './socket.service';

export const createNotification = async (
  recipientId: string,
  type: string,
  title: string,
  message: string,
  relatedItemId?: string,
  relatedClaimId?: string
): Promise<any> => {
  try {
    const notif = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedItemId: relatedItemId || null,
      relatedClaimId: relatedClaimId || null,
    });
    
    console.log(`Notification Service: Notification created for user ${recipientId}: "${title}"`);
    
    // Emit real-time notification to the user's personal room
    try {
      const io = getIO();
      io.to(`user:${recipientId}`).emit('new_notification', notif);
    } catch (socketError) {
      console.warn('Notification Service: Could not emit socket event', socketError);
    }

    return notif;
  } catch (error) {
    console.error('Notification Service Error:', error);
    return null;
  }
};
