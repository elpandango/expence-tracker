import { CategoryModel } from '~/server/models/CategoryModel';

const initialCategories = [
  { name: 'Food', icon: 'restaurant', color: '#FF7043' },
  { name: 'Transport', icon: 'train', color: '#4CAF50' },
  { name: 'Home', icon: 'home', color: '#FFB74D' },
  { name: 'Health', icon: 'medical_services', color: '#FF5252' },
  { name: 'Family', icon: 'family_restroom', color: '#9E9E9E' },

  { name: 'Fastfood', icon: 'fastfood', color: '#FF7043' },
  { name: 'Bar', icon: 'local_bar', color: '#FF5722' },

  { name: 'Car', icon: 'directions_car', color: '#4CAF50' },
  { name: 'Fuel', icon: 'local_gas_station', color: '#607D8B' },
  { name: 'Travel Transport', icon: 'airplanemode_active', color: '#4CAF50' },

  { name: 'Shopping', icon: 'shopping_cart', color: '#1976D2' },
  { name: 'Clothing', icon: 'checkroom', color: '#FFC107' },
  { name: 'Footwear', icon: 'steps', color: '#8BC34A' },
  { name: 'Technology', icon: 'smartphone', color: '#00BCD4' },
  { name: 'Entertainment', icon: 'stadia_controller', color: '#3F51B5' },

  { name: 'Rental Bill', icon: 'business', color: '#3F51B5' },
  { name: 'Energy Bill', icon: 'flash_on', color: '#FFEB3B' },
  { name: 'Water Bill', icon: 'invert_colors', color: '#2196F3' },
  { name: 'Waste Bill', icon: 'delete_forever', color: '#795548' },

  { name: 'Kids', icon: 'child_care', color: '#FF9800' },
  { name: 'Education', icon: 'school', color: '#2196F3' },

  { name: 'Pets', icon: 'pets', color: '#FFB300' },
  { name: 'Pet Food', icon: 'set_meal', color: '#FFA726' },
  { name: 'Gifts', icon: 'redeem', color: '#FF4081' },

  { name: 'Taxes', icon: 'gavel', color: '#9E9E9E' },
  { name: 'Other (Expenses)', icon: 'category', color: '#BDBDBD' }
];

export default defineEventHandler(async () => {
  const existingCategories = await CategoryModel.countDocuments();

  if (existingCategories === 0) {
    await CategoryModel.insertMany(initialCategories);
    console.log('Initial categories have been added.');
  } else {
    console.log('Categories already exist.');
  }
});
