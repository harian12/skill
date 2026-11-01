# Architecture Decision Guide

## Tujuan
Memilih arsitektur paling sederhana yang memenuhi kebutuhan sekarang dan memberi ruang evolusi yang wajar.

## Discovery
Periksa:
- ukuran dan batas domain;
- pola perubahan fitur;
- tim dan ownership;
- kebutuhan deployment/availability;
- dependency antar domain;
- data consistency;
- scaling profile;
- kebutuhan latency dan throughput;
- kemampuan operasional tim.

## Pilihan
- Simple layered: API kecil, sedikit domain, alur sederhana.
- Modular monolith: beberapa domain dengan deployment dan database bersama.
- Hexagonal/ports-and-adapters: boundary eksternal banyak atau business logic perlu terisolasi.
- CQRS: read/write model benar-benar berbeda secara kebutuhan atau beban.
- Event-driven: proses asynchronous dan decoupling memang diperlukan.
- Microservices: independent ownership/deployment/scaling/isolation memberi manfaat yang terukur.

## Aturan
Jangan memperkenalkan pattern hanya karena populer. Setiap abstraction harus menjawab masalah nyata. Catat trade-off untuk keputusan yang sulit dibalik.
