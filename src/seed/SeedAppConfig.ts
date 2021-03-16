import AppConfig from "../models/appConfig.model"

export const seedAppConfig = () => {
    return AppConfig.findOrCreate({ where: { pricePerToken: 1 } })
}