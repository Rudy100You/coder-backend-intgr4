export default class ResetKeyService {
  constructor(resetKeyRepository) {
    this.resetKeyRepository = resetKeyRepository;
  }
  findResetKeyById = async (id) => await this.resetKeyRepository.getOne(id);
  findResetKeyByCriteria = async (criteria) =>
    await this.resetKeyRepository.getOneByCriteria(criteria);
  existsByCriteria = async (criteria) =>
    await this.resetKeyRepository.existsByCriteria(criteria);
  createResetKey = async (email) => {
    const existingKey = await this.findResetKeyByCriteria({ email });
    if (existingKey) await this.deleteResetKey(existingKey._id);
    return await this.resetKeyRepository.create({ email });
  };
  deleteResetKey = async (id) => await this.resetKeyRepository.delete(id);
}
