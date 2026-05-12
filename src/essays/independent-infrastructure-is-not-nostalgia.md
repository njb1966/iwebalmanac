---
layout: layouts/base.njk
title: Independent Infrastructure Is Not Nostalgia
description: Self-hosting is not retro cosplay. Owning your infrastructure is a design decision about resilience, dependency, and what the web becomes.
date: 2026-05-12
---

Let me get something out of the way first.

You're probably assuming this is a nostalgia project. That I miss GeoCities, that I think everything was better before the algorithm, that this is some kind of retro affectation. It's not. That assumption matters enough to address upfront, because if you're reading this through that lens, nothing that follows will land right.

The case for owning your own infrastructure is about now. It's about what gets built next. Some of the tools involved are old, but that's not why they're worth using. They're worth using because they work, and because they were designed with a different set of priorities than the systems that replaced them.

Running your own server is not cosplay. It's a real technical decision with real consequences.

When your content lives on a platform, the platform decides what happens to it. Not in some vague, hand-wavy sense. In the concrete sense that platforms shut down, get acquired, change their terms of service, quietly throttle your reach, or one day just stop. You've seen this happen. You'll see it again. The companies running these platforms aren't your enemies. They're just not organized around your interests. That's the design. That's the starting point.

When you own your infrastructure, the connection between your work and the people reading it doesn't depend on some third party's willingness to keep facilitating that relationship. That's resilience in the plain engineering sense of the word. Fewer failure points. Fewer dependencies. More control over what happens when something breaks. A site running on a VPS you control, serving static files, backed up to storage you own, is genuinely hard to kill. The same content on a platform is contingent in ways that are easy to ignore right up until they're not.

The decentralization argument gets made loudly and badly, which makes it easy to dismiss. But set aside the ideology and you're left with a structural observation: systems with many independent nodes fail more gracefully than systems with central points of control. This isn't politics. It's how networks behave. When one company controls a significant share of where people read and write online, that's a concentration of architectural power, and it has effects whether or not that company ever exercises it badly.

Static publishing is misunderstood in a specific way. People treat it like an ideological stance, as if picking a static site generator is a values statement. It's not. In a lot of cases, static is just the right answer. If your site publishes articles, documentation, or essays, it doesn't need a database. It doesn't need a runtime that can be compromised, exploited, or patched on someone else's schedule. A folder of HTML files served by a web server that has been doing exactly this for thirty years is fast, cheap, easy to cache, and easy to understand. That's not an aesthetic choice. It's a practical one.

Protocols are where people most consistently underestimate what's happening. HTTP is older than most of the people building on it. Email predates the commercial web. RSS was declared dead a decade ago and remains the most reliable way to follow a publication without that publication's distribution being filtered through someone else's algorithm. These protocols have lasted because they solved real problems in general enough ways to stay useful as everything around them changed. Platforms don't work like that. The dominant platforms of fifteen years ago are mostly gone or diminished. The protocols they ran on are still running.

There's a distinction worth holding onto: the difference between a design decision and an aesthetic one. Independence is a design decision. It has costs. You maintain things yourself, you make decisions a platform would otherwise make for you, you give up the network effect that comes from being inside a large system. Those costs are real. But they're the costs of a specific tradeoff, not the price of a lifestyle.

What changes when more people make this choice isn't just the look of the web, though that changes too. What changes is the architecture. A web where content is spread across more independently controlled places is structurally different from one where most of it flows through a handful of intermediaries. Harder to break from any single point. Harder to control from any single point.

The Independent Web Almanac covers the decisions involved in building that way. Self-hosting, open protocols, static publishing, small infrastructure — the technical and editorial choices that go into actually owning what you put online. It's written for people already doing this, people considering it, and people who want to understand the argument before deciding whether it applies to them. The writing will be direct, the technical coverage will be specific, and the position is that independence is worth the work. Not as a statement of values, but as a conclusion from watching how these systems actually behave.
