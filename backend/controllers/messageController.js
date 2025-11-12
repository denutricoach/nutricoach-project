const Message = require('../models/Message');
const User = require('../models/User');
const Coach = require('../models/Coach');

// Hulpfunctie om te bepalen of de ontvanger een User of Coach is
const getModelName = (isCoach) => isCoach ? 'Coach' : 'User';

// Haal alle berichten op tussen de ingelogde gebruiker en een andere gebruiker
exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.otherUserId;
    
    // Creëer een consistente conversationId door de IDs te sorteren
    const conversationId = [currentUserId.toString(), otherUserId].sort().join('_');

    const messages = await Message.find({ conversationId: conversationId }).sort({ timestamp: 1 });
    
    // Markeer berichten gericht aan de huidige gebruiker als gelezen
    // Dit wordt nu gedaan door de markAsRead route in de frontend
    /*
    await Message.updateMany(
      { conversationId: conversationId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );
    */

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Kon berichten niet ophalen.' });
  }
};

// Stuur een nieuw bericht
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    const isSenderCoach = req.isCoach;

    // Bepaal de ontvanger
    let receiverAccount = await User.findById(receiverId);
    let isReceiverCoach = false;
    if (!receiverAccount) {
        receiverAccount = await Coach.findById(receiverId);
        isReceiverCoach = true;
    }
    if (!receiverAccount) {
        return res.status(404).json({ message: 'Ontvanger niet gevonden.' });
    }

    const conversationId = [senderId.toString(), receiverId].sort().join('_');

    const newMessage = new Message({
      conversationId,
      sender: senderId,
      senderModel: getModelName(isSenderCoach),
      receiver: receiverId,
      receiverModel: getModelName(isReceiverCoach),
      content,
      read: false
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Kon bericht niet versturen.' });
  }
};

// Tel het aantal ongelezen berichten voor de ingelogde gebruiker
exports.getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.otherUserId;
    const conversationId = [currentUserId.toString(), otherUserId].sort().join('_');
    
    const count = await Message.countDocuments({
      conversationId: conversationId,
      receiver: currentUserId,
      read: false
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Kon ongelezen berichten niet tellen.' });
  }
};

// Markeer berichten als gelezen (wordt nu ook gedaan in getMessages, maar behouden voor flexibiliteit)
exports.markAsRead = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.otherUserId;
    const conversationId = [currentUserId.toString(), otherUserId].sort().join('_');
    await Message.updateMany(
      { conversationId: conversationId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );
    
    res.status(200).json({ message: 'Berichten als gelezen gemarkeerd.' });
  } catch (error) {
    res.status(500).json({ message: 'Kon berichten niet als gelezen markeren.' });
  }
};
