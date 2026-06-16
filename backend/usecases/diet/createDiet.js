const { validateDiet, normalizeName } = require('../../helpers/validate-diet');

async function createDiet({ data, user, DietRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const validation = validateDiet(data);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const d = data || {};
  const name = normalizeName(d.name);

  const existing = await DietRepository.findByName(name);
  if (existing) {
    return {
      success: false,
      status: 409,
      errors: ['Já existe uma dieta com este nome!'],
    };
  }

  const diet = await DietRepository.create({
    name,
    type: d.type,
    goal: d.goal !== undefined ? d.goal.trim() : '',
    dailyCalories: typeof d.dailyCalories === 'number' ? d.dailyCalories : null,
    durationDays: typeof d.durationDays === 'number' ? d.durationDays : null,
    mealsPerDay: typeof d.mealsPerDay === 'number' ? d.mealsPerDay : null,
    
    restrictions: Array.isArray(d.restrictions)
      ? d.restrictions.map((r) => r.trim())
      : [],
    notes: d.notes !== undefined ? d.notes.trim() : '',
    startDate: d.startDate ? new Date(d.startDate) : null,
    endDate: d.endDate ? new Date(d.endDate) : null,
    mealFrequency: typeof d.mealFrequency === 'number' ? d.mealFrequency : null,
    pet: d.pet && d.pet._id ? { _id: d.pet._id, name: d.pet.name || null } : null,
    user: { _id: user._id, name: user.name },
    deletedAt: null,
  });

  return { success: true, status: 201, diet };
}

module.exports = { createDiet };
