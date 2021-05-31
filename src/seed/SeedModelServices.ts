import ServiceModel from "../models/services.model"
import services from "./modelServices"

export const seedService = () => {
    return ServiceModel
        .bulkCreate(services.map((s, idx) => ({ id: (idx + 1), name: s })), { updateOnDuplicate: ["name"]})
}