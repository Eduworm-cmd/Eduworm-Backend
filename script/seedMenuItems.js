const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItemModel');
require('dotenv').config();

// Define roles
const Roles = {
  SUPERADMIN: 'superadmin',
  SCHOOLADMIN: 'schooladmin',
  TEACHER: 'teacher',
};

// Connect to database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define icons as strings - these are the Lucide React icon component names
const Icons = {
  LayoutDashboard: 'LayoutDashboard',
  Users: 'Users',
  Settings: 'Settings',
  NotebookPen: 'NotebookPen'
};

// Define admin data (same structure as your frontend data but with string icon names)
const adminData = {
  title: "Super Admin Panel",
  buttons: [
    {
      title: "Dashboard",
      url: "/eduworm-admin/home",
      icon: Icons.LayoutDashboard,
    },
  ],
  footersBtns: [
    {
      title: "Settings",
      url: "/home",
      icon: Icons.Settings,
    },
  ],
  navMain: [
    {
      title: "School Management",
      icon: Icons.Users,
      items: [
        { title: "Add School", url: "/eduworm-admin/school/add" },
        { title: "School List", url: "/eduworm-admin/school/list" },
        { title: "Student Data", url: "/eduworm-admin/student" },
        { title: "Staff Data", url: "/eduworm-admin/staff" },
        { title: "Academic Year", url: "/eduworm-admin/academic Year" },
        { title: "Grade Management", url: "/eduworm-admin/grade" },
        { title: "Classroom Management", url: "/eduworm-admin/classroom" },
        { title: "Toggle Tabs", url: "/eduworm-admin/toogletabs" },
      ]
    },
    {
      title: "LMS Management",
      icon: Icons.NotebookPen,
      items: [
        { title: "Playlists & Assigement", url: "/eduworm-admin/playlist" },
        { title: "Content", url: "/eduworm-admin/content" },
        { title: "Sheduled List", url: "/eduworm-admin/scheduleList" },
        { title: "Assignment History", url: "/admin/teachers/add" },
        { title: "Result & Summary", url: "/admin/teachers/add" },
      ]
    },
    {
      title: "Lesson Management",
      icon: Icons.Users,
      items: [
        { title: "Lesson Plan", url: "/admin/teachers" },
        { title: "Teach", url: "/admin/teachers" },
      ]
    },
    {
      title: "Finance & Billing",
      icon: Icons.Users,
      items: [
        { title: "Invoice", url: "/eduworm-admin/curriculum" },
        { title: "Balance & Refund", url: "/eduworm-admin/curriculum" },
        { title: "Receipts", url: "/eduworm-admin/curriculum" },
      ]
    },
    {
      title: "Library & Resource Catalog",
      icon: Icons.Users,
      items: [
        { title: "E‑books List", url: "/admin/teachers" },
        { title: "Videos", url: "/admin/teachers/add" },
        { title: "Lesson Plans", url: "/admin/teachers/add" },
      ]
    },
    {
      title: "Notification Schedules",
      icon: Icons.Users,
      items: [
        { title: "Notification ", url: "/eduworm-admin/Notification" },
        { title: "Delivery Schedules", url: "/admin/teachers/add" },
        { title: "Communication Logs", url: "/eduworm-admin/communication-hub" },
      ]
    },
  ]
};

// Define school admin data
const schoolAdminData = {
  title: "School Admin Panel",
  buttons: [
    {
      title: "Dashboard",
      url: "/eduworm-school/home",
      icon: Icons.LayoutDashboard,
    },
    {
      title: "AI Reports",
      url: "/eduworm-admin/home",
      icon: Icons.LayoutDashboard,
    },
  ],
  footersBtns: [
    {
      title: "Settings",
      url: "/home",
      icon: Icons.Settings,
    },
  ],
  navMain: [
    {
      title: "Center Management",
      icon: Icons.Users,
      items: [
        { title: "Student Data", url: "/eduworm-admin" },
        { title: "Staff Data", url: "/eduworm-admin/school/list" },
        { title: "Academic Year", url: "/eduworm-admin/staff/add" },
        { title: "Grade Management", url: "/eduworm-admin/staff/list" },
        { title: "Classroom Management", url: "/eduworm-admin/staff/list" },
      ]
    },
    {
      title: "LMS Management",
      icon: Icons.NotebookPen,
      items: [
        { title: "Playlist/ Assignment", url: "/eduworm-school/playlist" },
        { title: "Content", url: "/eduworm-school/content" },
        { title: "Scheduled List", url:"/eduworm-school/scheduleList" },
        { title: "Assignment History", url: "/admin/teachers/add" },
      ]
    },
    {
      title: "Lesson Management",
      icon: Icons.Users,
      items: [
        { title: "Lesson Plan", url: "/admin/teachers" },
        { title: "PlayList / Assignment", url: "/eduworm-school/playlist" },
        { title: "Content", url: "/eduworm-school/content" },
        { title: "Schedule List", url: "/eduworm-school/scheduleList" },
        { title: "Tech", url: "/admin/teachers" },
      ]
    },
    {
      title: "Finance & Billing",
      icon: Icons.Users,
      items: [
        { title: "Invoice", url: "/eduworm-admin/curriculum" },
        { title: "Balance & Refund", url: "/eduworm-admin/curriculum" },
        { title: "Receipts", url: "/eduworm-admin/curriculum" },
      ]
    },
    {
      title: "Document Management",
      icon: Icons.Users,
      items: [
        { title: "Manage Documents", url: "/admin/teachers" },
        { title: "Daily Diary", url: "/admin/teachers/add" },
      ]
    },
    // Empty title section
    {
      title: "",
      icon: Icons.Users,
      items: [
        { title: "Manage Documents", url: "/admin/teachers" },
        { title: "Daily Diary", url: "/admin/teachers/add" },
      ]
    },
  ]
};

// Define teacher data (if you need it)
const teacherData = {
  title: "Teacher Dashboard",
  buttons: [
    {
      title: "Dashboard",
      url: "/eduworm-teacher/home",
      icon: Icons.LayoutDashboard,
    }
  ],
  footersBtns: [
    {
      title: "Settings",
      url: "/home",
      icon: Icons.Settings,
    }
  ],
  navMain: [
    // Add teacher menu items if needed
  ]
};

async function seedMenuItems() {
  try {
    // Clear existing data
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');
    
    // Helper function to create menu items
    const createItems = async (data, role) => {
      console.log(`Creating menu items for ${role}...`);
      
      // Create main buttons
      for (let i = 0; i < data.buttons.length; i++) {
        const button = data.buttons[i];
        await MenuItem.create({
          title: button.title,
          url: button.url,
          icon: button.icon,
          forRole: role,
          type: 'button',
          order: i
        });
      }
      
      // Create footer buttons
      for (let i = 0; i < data.footersBtns.length; i++) {
        const button = data.footersBtns[i];
        await MenuItem.create({
          title: button.title,
          url: button.url,
          icon: button.icon,
          forRole: role,
          type: 'footerBtn',
          order: i
        });
      }
      
      // Create main navigation items
      for (let i = 0; i < data.navMain.length; i++) {
        const nav = data.navMain[i];
        
        // Skip items with empty titles
        if (!nav.title && nav.title.trim() === '') continue;
        
        // Create parent item
        await MenuItem.create({
          title: nav.title,
          url: '#',
          icon: nav.icon,
          forRole: role,
          type: 'main',
          isParent: true,
          order: i
        });
        
        // Create child items
        for (let j = 0; j < nav.items.length; j++) {
          const item = nav.items[j];
          await MenuItem.create({
            title: item.title,
            url: item.url,
            forRole: role,
            type: 'main',
            parent: nav.title,
            order: j
          });
        }
      }
    };
    
    // Seed data for each role
    await createItems(adminData, Roles.SUPERADMIN);
    await createItems(schoolAdminData, Roles.SCHOOLADMIN);
    await createItems(teacherData, Roles.TEACHER);
    
    console.log('Menu items seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding menu items:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
}

seedMenuItems();