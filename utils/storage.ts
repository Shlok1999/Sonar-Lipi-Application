import AsyncStorage from '@react-native-async-storage/async-storage';
import { TAALS } from './taals';

const STORAGE_KEY = 'indian_music_compositions';

export const loadCompositions = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading compositions:', error);
    return [];
  }
};

export const loadComposition = async (id) => {
  try {
    const compositions = await loadCompositions();
    return compositions.find(comp => comp.id === id) || null;
  } catch (error) {
    console.error('Error loading composition:', error);
    return null;
  }
};

export const createComposition = async ({ name, taalId, taal, grid }) => {
  try {
    const compositions = await loadCompositions();
    
    // Generate a unique ID
    const id = `composition_${Date.now()}`;
    const createdAt = new Date().toISOString();
    
    const newComposition = {
      id,
      name,
      taalId,
      taal,
      grid,
      createdAt,
      lastEdited: createdAt,
    };
    
    // Add the new composition to the list
    const updatedCompositions = [...compositions, newComposition];
    
    // Save the updated list
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCompositions));
    
    return newComposition;
  } catch (error) {
    console.error('Error creating composition:', error);
    throw error;
  }
};

export const saveComposition = async (composition) => {
  try {
    const compositions = await loadCompositions();
    
    // Find the index of the composition
    const index = compositions.findIndex(comp => comp.id === composition.id);
    
    if (index === -1) {
      throw new Error('Composition not found');
    }
    
    // Update the composition
    compositions[index] = composition;
    
    // Save the updated list
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(compositions));
    
    return composition;
  } catch (error) {
    console.error('Error saving composition:', error);
    throw error;
  }
};

export const deleteComposition = async (id) => {
  try {
    const compositions = await loadCompositions();
    
    // Filter out the composition to delete
    const updatedCompositions = compositions.filter(comp => comp.id !== id);
    
    // Save the updated list
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCompositions));
    
    return true;
  } catch (error) {
    console.error('Error deleting composition:', error);
    throw error;
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

//clear user data as well
export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem('user_data');
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
};

const CompleteClear = async () => {
  try {
    await AsyncStorage.clear();
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
  }
};

// CompleteClear();