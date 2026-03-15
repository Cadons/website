import { defineCollection, z } from 'astro:content';
//posts define the collection of the content:
// the type is content,
// the schema is defined by zod, zod is a library for defining and validating data structures,
// it has title,
// description,
// date,
// tags and draft fields, the date field is coerced to date type,
// the tags field is an array of strings and has a default value of an empty array, the draft field is a boolean and has a default value of false
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };//record the collection of the content with the name post, this will create post.slug and post.body
