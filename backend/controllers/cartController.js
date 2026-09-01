




import Cart from '../models/Cart.js';
import Artwork from '../models/Artwork.js';

// Get Cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let cart = await Cart.findOne({ userId })
      .populate('items.artworkId', 'title imageUrl fixedPrice quantity soldQuantity artistId');
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }
    
    let subtotal = 0;
    const cartItems = [];
    
    for (const item of cart.items) {
      const artwork = item.artworkId;
      if (artwork) {
        const available = artwork.quantity - (artwork.soldQuantity || 0);
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        cartItems.push({
          _id: item._id,
          artworkId: artwork._id,
          title: artwork.title,
          imageUrl: artwork.imageUrl,
          artistId: artwork.artistId,
          price: item.price,
          quantity: item.quantity,
          availableQuantity: available,
          inStock: available > 0,
          subtotal: itemTotal,
          addedAt: item.addedAt
        });
      }
    }
    
    const platformFee = Math.round(subtotal * 0.05 * 100) / 100;
    const total = Math.round((subtotal + platformFee) * 100) / 100;
    
    res.json({
      success: true,
      cart: {
        items: cartItems,
        totalItems: cartItems.length,
        _id: cart._id,
        userId: cart.userId,
        updatedAt: cart.updatedAt
      },
      subtotal: Math.round(subtotal * 100) / 100,
      platformFee,
      total
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add to Cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { artworkId, quantity = 1 } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }
    
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }
    
    if (!artwork.isFixedPrice) {
      return res.status(400).json({ error: 'This artwork is not available for direct purchase' });
    }
    
    if (artwork.artistId.toString() === userId.toString()) {
      return res.status(400).json({ error: 'You cannot purchase your own artwork' });
    }
    
    const available = artwork.quantity - (artwork.soldQuantity || 0);
    if (available <= 0) {
      return res.status(400).json({ error: 'Artwork is out of stock' });
    }
    
    if (quantity > available) {
      return res.status(400).json({ error: `Only ${available} units available` });
    }
    
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    const existingItem = cart.items.find(
      item => item.artworkId.toString() === artworkId
    );
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > available) {
        return res.status(400).json({ error: `Only ${available} units available` });
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        artworkId,
        quantity,
        price: artwork.fixedPrice
      });
    }
    
    cart.updatedAt = new Date();
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.artworkId', 'title imageUrl fixedPrice quantity soldQuantity artistId');
    
    res.json({
      success: true,
      message: 'Item added to cart',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update Cart Item Quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 0) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    if (quantity === 0) {
      cart.items.pull(itemId);
    } else {
      const artwork = await Artwork.findById(item.artworkId);
      if (!artwork) {
        return res.status(404).json({ error: 'Artwork not found' });
      }
      
      const available = artwork.quantity - (artwork.soldQuantity || 0);
      if (quantity > available) {
        return res.status(400).json({ error: `Only ${available} units available` });
      }
      
      item.quantity = quantity;
    }
    
    cart.updatedAt = new Date();
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.artworkId', 'title imageUrl fixedPrice quantity soldQuantity artistId');
    
    res.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove from Cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items.pull(itemId);
    cart.updatedAt = new Date();
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.artworkId', 'title imageUrl fixedPrice quantity soldQuantity artistId');
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Clear Cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
    
    res.json({
      success: true,
      message: 'Cart cleared',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Cart Item Count (for badge)
export const getCartCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const cart = await Cart.findOne({ userId });
    const count = cart ? cart.items.length : 0;
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({ error: error.message });
  }
};