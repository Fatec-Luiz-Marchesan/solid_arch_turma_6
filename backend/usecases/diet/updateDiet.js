const { validateDiet, normalizeName } = require('../../helpers/validate-diet');

async function updateDiet({ id, data, user, DietRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] };
  }

  const diet = await DietRepository.findById(id);
  if (!diet || diet.deletedAt) {
    return { success: false, status: 404, errors: ['Dieta não encontrada!'] };
  }

  const validation = validateDiet(data, { partial: true });
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const d = data || {};
  const updatePayload = {};

  if (d.name !== undefined) {
    const name = normalizeName(d.name);
    if (name.toLowerCase() !== String(diet.name).toLowerCase()) {
      const existing = await DietRepository.findByName(name);
      if (existing && String(existing._id) !== String(id)) {
        return {
          success: false,
          status: 409,
          errors: ['Já existe uma dieta com este nome!'],
        };
      }
    }
    updatePayload.name = name;
  }

  if (d.type !== undefined) updatePayload.type = d.type;
  if (d.goal !== undefined) updatePayload.goal = d.goal.trim();
  if (d.dailyCalories !== undefined) updatePayload.dailyCalories = d.dailyCalories;
  if (d.durationDays !== undefined) updatePayload.durationDays = d.durationDays;
  if (d.mealsPerDay !== undefined) updatePayload.mealsPerDay = d.mealsPerDay;
  if (d.restrictions !== undefined) {
    updatePayload.restrictions = d.restrictions.map((r) => r.trim());
  }
  if (d.notes !== undefined) updatePayload.notes = d.notes.trim();

  const updated = await DietRepository.update(id, updatePayload);
  return { success: true, status: 200, diet: updated };
}

module.exports = { updateDiet };
