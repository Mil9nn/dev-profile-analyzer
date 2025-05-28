import { z } from "zod"

export const formSchema = z.object({
    githubProfile: z
        .string()
        .url("Invalid GitHub URL")
        .optional()
        .or(z.literal("")),
    linkedinProfile: z
        .string()
        .url("Invalid LinkedIn URL")
        .optional()
        .or(z.literal("")),
    repositories: z
        .array(z.string().url("Invalid repository URL").optional().or(z.literal("")))
        .refine(
            (repos) => repos.filter((repo) => repo && repo.trim() !== "").length >= 1,
            { message: "At least one repository is required." }
        ),
})