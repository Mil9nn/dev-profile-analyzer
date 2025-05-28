import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useAnalysisStore } from "../hooks/useAnalysisStore"
import { formSchema } from "../schemas/formSchema"
import type { FormData } from "../types";
import { GitHubInput, LinkedInInput, RepositoryInput } from './form/FormInputs'

export function ProfileAnalysisForm() {
    const { loading, analyzeProfile } = useAnalysisStore();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            githubProfile: "",
            linkedinProfile: "",
            repositories: ["", "", ""],
        },
    });

    const onSubmit = async (values: FormData) => {
        await analyzeProfile(values);
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4  max-w-[400px] p-4 shadow-lg bg-zinc-950 rounded-md">
                <GitHubInput control={form.control} />
                <LinkedInInput control={form.control} />

                {form.watch("repositories").map((_, index) => (
                    <RepositoryInput key={index} control={form.control} index={index} />
                ))}

                <Button type="submit" disabled={loading}>
                    {loading ? "Analyzing..." : "Submit"}
                </Button>
            </form>
        </Form>
    );
}