const services = require("./modelServices.json");
import ServiceModel from "../models/services.model"

export const seedService = () => {
    return ServiceModel
        .bulkCreate(services.map((s: string, idx: number) => ({ id: (idx + 1), name: s })), { updateOnDuplicate: ["name"]})
}