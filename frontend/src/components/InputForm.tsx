import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { useState } from "react"
import { axiosInstance } from '../lib/axios.ts'

// ----------------------
// Schema Validation
// ----------------------
const formSchema = z.object({
    jobTitle: z.string().min(2, {
        message: "Job title is required.",
    }),
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

// ----------------------
// Response Type
// ----------------------
type AnalyzeResponse = {
    score: number;
    hiringPotential: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

export function ProfileForm() {
    const [result, setResult] = useState<AnalyzeResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            jobTitle: "",
            githubProfile: "",
            linkedinProfile: "",
            repositories: ["", "", ""],
        },
    })

    // ----------------------
    // Handle Submit
    // ----------------------
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const res = await axiosInstance.post<AnalyzeResponse>('/analyze', values);
            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-4">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 max-w-[400px] p-4 shadow-lg border border-gray-200 rounded-md"
                >
                    {/* Job Title */}
                    <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Backend Developer" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Github Profile */}
                    <FormField
                        control={form.control}
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

                    {/* LinkedIn Profile */}
                    <FormField
                        control={form.control}
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

                    {/* Repositories */}
                    {form.watch("repositories").map((_, index) => (
                        <FormField
                            key={index}
                            control={form.control}
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
                    ))}

                    <Button type="submit" disabled={loading}>
                        {loading ? "Analyzing..." : "Submit"}
                    </Button>
                </form>
            </Form>

            {/* ---------------------- */}
            {/* Results Section */}
            {/* ---------------------- */}
            <section className="mt-6">
                {loading && <p className="text-sm text-gray-500">Analyzing repositories...</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}
                {result && (
                    <div className="p-4 border rounded-md text-black bg-gray-50 mt-4 space-y-4">
                        <div>
                            <strong>Suggestions:</strong>
                            <ul className="list-disc pl-5">
                                {result.aiFeedback}
                            </ul>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}