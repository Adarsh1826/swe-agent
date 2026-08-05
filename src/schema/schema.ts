import { pgTable, varchar } from "drizzle-orm/pg-core"
export const userTable = pgTable("users",{
    name:varchar().notNull()
})