FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    postgresql \
    postgresql-contrib \
  && rm -rf /var/lib/apt/lists/*

# Node.js 22 (matches Cloud Agent default)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@10.33.3 --activate

RUN useradd -m -s /bin/bash ubuntu \
  && usermod -aG sudo ubuntu \
  && echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER ubuntu
WORKDIR /workspace
