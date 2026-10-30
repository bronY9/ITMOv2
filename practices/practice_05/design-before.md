# Design fragment before the project rule

The interaction flow is: the client submits a preview request, FastAPI and
`ReviewRequest` reject structural input errors, the shared helper checks size
and meaningful content, and the route returns the success response. The review
service and LLM are not part of this flow. For a real review, the same schema and
helper run before the route calls `ReviewService`, which then calls the LLM.
