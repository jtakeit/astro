# Security

The kit runs in a site's build and in a visitor's browser; the platform it
talks to is not in this repository. A vulnerability in the kit — the forms,
the elements, the catalogue tool, the lint — is reported privately through
GitHub: **Security → Report a vulnerability** on this repository. Please do
not open a public issue for it.

What a report needs: the version (`npm view @jtakeit/kit version`, or the
one in your lockfile), what the kit does that it should not, and how to
see it. A fix goes out as a patch release, and the advisory names the
versions it covers.

A vulnerability in the platform (the panel, the API, the edge) is reported
the same way on [jtakeit-core](https://github.com/jtakeit/jtakeit-core) if
you can see it, or by writing to the address on jtakeit.com.
