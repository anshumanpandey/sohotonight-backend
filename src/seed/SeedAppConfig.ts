import AppConfig from "../models/appConfig.model"

export const seedAppConfig = () => {
    return AppConfig.findOrCreate({ where: { id: 1, pricePerToken: 1 } })
}