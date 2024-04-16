# Database IDs

Initially, UUID V4 was used, but since they have multiple issues with them (https://unkey.dev/blog/uuid-ux, https://planetscale.com/blog/the-problem-with-using-a-uuid-primary-key-in-mysql) and with the recent talks about [Nano IDs](https://zelark.github.io/nano-id-cc/), I've migrate to using Nano IDs.

There's many ways to customize a Nano ID, here's a few I've seen in the wild:
* PlanetScale (https://planetscale.com/blog/why-we-chose-nanoids-for-planetscales-api)
  * Alphabet: `0123456789abcdefghijklmnopqrstuvwxyz`
  * Length: `12`
  * 308M IDs to have 1% probability of collision
* Unkey (https://unkey.dev/blog/uuid-ux)
  * Alphabet: `123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`
  * Length: `22`
  * 3,542,527T IDs to have 1% probability of collision

Let's create it small for now and this can always be changed as the project grows.

The Nano IDs are created in PostgreSQL using a modified procedure from https://github.com/viascom/nanoid-postgres/blob/main/nanoid.sql (it takes the optimized version hardcodes the parameters based on the alphabet and the desired size). The following query helps with knowing what params to put for that custom procedure:

```sql
WITH input(alphabet, size) AS (
	VALUES('0123456789abcdefghijklmnopqrstuvwxyz', 12)
), input2(alphabet, size, alphabetLength) AS (
	SELECT alphabet, size, length(alphabet)
	FROM input
), input3(additionalBytesFactor, mask, size, alphabetLength) AS (
	SELECT 
		round(1 + abs((((2 << cast(floor(log(alphabetLength - 1) / log(2)) AS int)) - 1) - alphabetLength::numeric) / alphabetLength), 2),
		(2 << cast(floor(log(alphabetLength - 1) / log(2)) AS int)) - 1,
		size,
		alphabetLength
	FROM input2
) SELECT
  size,
  mask,
  cast(ceil(additionalBytesFactor * mask * size / alphabetLength) AS int) AS "step",
  alphabetLength
FROM input3;
```