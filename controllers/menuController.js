const MenuItem = require('../models/MenuItemModel');

// Get menu items for a specific role
exports.getMenuItems = async (req, res) => {
  try {
    const { role } = req.params;
    
    const menuItems = await MenuItem.find({ 
      forRole: role,
      isActive: true 
    }).sort({ order: 1 });
    
    // Format data to match your frontend structure
    const formattedMenu = formatMenuData(menuItems, role);
    
    res.status(200).json({ 
      success: true, 
      data: formattedMenu 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching menu items', 
      error: error.message 
    });
  }
};

// Toggle menu item visibility
exports.toggleMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id);
    
    if (!menuItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }
    
    menuItem.isActive = !menuItem.isActive;
    await menuItem.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Menu item toggled successfully',
      isActive: menuItem.isActive
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error toggling menu item', 
      error: error.message 
    });
  }
};

// Helper function to format menu data for frontend
function formatMenuData(items, role) {
  // Base structure
  const result = {
    title: role === 'superadmin' ? 'Super Admin Panel' : 'School Admin Panel',
    buttons: [],
    footersBtns: [],
    navMain: []
  };
  
  // Group items by their type and parent
  const mainItems = items.filter(item => item.type === 'main' && item.isParent);
  const buttonItems = items.filter(item => item.type === 'button');
  const footerItems = items.filter(item => item.type === 'footerBtn');
  
  // Format main navigation with sub-items
  mainItems.forEach(parent => {
    const subItems = items.filter(item => 
      item.parent === parent.title && item.type === 'main' && !item.isParent
    );
    
    result.navMain.push({
      title: parent.title,
      icon: parent.icon,
      items: subItems.map(item => ({
        title: item.title,
        url: item.url
      }))
    });
  });
  
  // Format buttons
  result.buttons = buttonItems.map(item => ({
    title: item.title,
    url: item.url,
    icon: item.icon
  }));
  
  // Format footer buttons
  result.footersBtns = footerItems.map(item => ({
    title: item.title,
    url: item.url,
    icon: item.icon
  }));
  
  return result;
}

// Create new menu item
exports.createMenuItem = async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Menu item created successfully',
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating menu item', 
      error: error.message 
    });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating menu item',
      error: error.message
    });
  }
};

// List all menu items for admin management
exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ forRole: 1, order: 1 });
    
    res.status(200).json({ 
      success: true, 
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching menu items', 
      error: error.message 
    });
  }
};