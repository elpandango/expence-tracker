import { CategoryModel } from '~/server/models/CategoryModel';

const archivedCategoryNames = [
  'Fastfood',
  'Bar',
  'Fuel',
  'Energy Bill',
  'Water Bill',
  'Waste Bill',
  'Pet Food',
];

const initialCategories = [
  { name: 'Food', icon: 'restaurant', color: '#FF7043', archived: false },
  { name: 'Transport', icon: 'train', color: '#4CAF50', archived: false },
  { name: 'Home', icon: 'home', color: '#FFB74D', archived: false },
  { name: 'Health', icon: 'medical_services', color: '#FF5252', archived: false },
  { name: 'Family', icon: 'family_restroom', color: '#9E9E9E', archived: false },

  { name: 'Fastfood', icon: 'fastfood', color: '#FF7043', archived: true },
  { name: 'Bar', icon: 'local_bar', color: '#FF5722', archived: true },

  { name: 'Car', icon: 'directions_car', color: '#4CAF50', archived: false },
  { name: 'Fuel', icon: 'local_gas_station', color: '#607D8B', archived: true },
  { name: 'Travel Transport', icon: 'airplanemode_active', color: '#4CAF50', archived: false },

  { name: 'Shopping', icon: 'shopping_cart', color: '#1976D2', archived: false },
  { name: 'Clothing', icon: 'checkroom', color: '#FFC107', archived: false },
  { name: 'Footwear', icon: 'steps', color: '#8BC34A', archived: false },
  { name: 'Technology', icon: 'smartphone', color: '#00BCD4', archived: false },
  { name: 'Entertainment', icon: 'stadia_controller', color: '#3F51B5', archived: false },

  { name: 'Rental Bill', icon: 'business', color: '#3F51B5', archived: false },
  { name: 'Energy Bill', icon: 'flash_on', color: '#FFEB3B', archived: true },
  { name: 'Water Bill', icon: 'invert_colors', color: '#2196F3', archived: true },
  { name: 'Waste Bill', icon: 'delete_forever', color: '#795548', archived: true },

  { name: 'Kids', icon: 'child_care', color: '#FF9800', archived: false },
  { name: 'Education', icon: 'school', color: '#2196F3', archived: false },

  { name: 'Pets', icon: 'pets', color: '#FFB300', archived: false },
  { name: 'Pet Food', icon: 'set_meal', color: '#FFA726', archived: true },
  { name: 'Gifts', icon: 'redeem', color: '#FF4081', archived: false },

  { name: 'Taxes', icon: 'gavel', color: '#9E9E9E', archived: false },
  { name: 'Other (Expenses)', icon: 'category', color: '#BDBDBD', archived: false }
];

export default defineEventHandler(async () => {
  const existingCategories = await CategoryModel.countDocuments();

  if (existingCategories === 0) {
    await CategoryModel.insertMany(initialCategories);
    console.log('Initial categories have been added.');
  } else {
    await CategoryModel.updateMany(
      { name: { $in: archivedCategoryNames } },
      { $set: { archived: true } }
    );

    await CategoryModel.updateMany(
      {
        name: {
          $nin: archivedCategoryNames,
        },
        archived: { $exists: false },
      },
      { $set: { archived: false } }
    );

    console.log('Categories already exist.');
  }
});
