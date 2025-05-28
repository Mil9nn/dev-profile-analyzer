import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Control } from "react-hook-form"
import type { FormData } from "../types"

interface FormInputsProps {
    control: Control<FormData>;
}

export function GitHubInput({ control }: FormInputsProps) {
    return (
        <FormField
            control={control}
            name="githubProfile"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>GitHub Profile</FormLabel>
                    <FormControl>
                        <Input placeholder="https://github.com/username" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

export function LinkedInInput({ control }: FormInputsProps) {
    return (
        <FormField
            control={control}
            name="linkedinProfile"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>LinkedIn Profile</FormLabel>
                    <FormControl>
                        <Input placeholder="https://linkedin.com/in/username" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

interface RepositoryInputProps {
    control: Control<FormData>;
    index: number;
}

export function RepositoryInput({ control, index }: RepositoryInputProps) {
    return (
        <FormField
            control={control}
            name={`repositories.${index}` as const}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Repository {index + 1}</FormLabel>
                    <FormControl>
                        <Input placeholder="https://github.com/user/repo" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}