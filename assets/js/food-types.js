import { DISH_OPTIONS, TYPE_POSE } from './layout.js';

export const FOOD_TYPES = DISH_OPTIONS.map((item) => ({ id: item.value, label: item.label }));

export function foodLabel(type) {
    return TYPE_POSE[type]?.name || FOOD_TYPES.find((item) => item.id === type)?.label || 'Food';
}

export function defaultName(type) {
    return foodLabel(type);
}
