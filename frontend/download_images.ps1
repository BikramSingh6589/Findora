$images = @(
  @{
    url = "https://lh3.googleusercontent.com/aida-public/AB6AXuAMNNVafyFBdWYKQN3-EIORPsyBQajYHgIKydsj88MGUkvJtvTMBxPbltjF7o4Q8Q6f6m_hnntzmkmGkJOXaOiYL056iwdUEvePn33fi7s9e2uNSm1xjSP9vQdmFzVSx48vfSvA8m0SJweCeO1QapBroFZBmG-D428XaGJOlfzqqAoHV32AAJQ0l2HHVUKaZLvH27vyb8BbuSaWIky2SBqxZmLQYFZoB3vWldR2ofq8WDzH7Pyl7-ts"
    name = "forgot_password_illustration.png"
  },
  @{
    url = "https://lh3.googleusercontent.com/aida-public/AB6AXuAqST5S7h0w2iZh4zHwEQLutgCjexaK5zAzbr91v3FDc7kGE1DI_am3zwbaYm5esBxGjiyvDUipndNnVMiUEe09f7qAe7wmntfxfnzamW7m29saiIOKF8Yt2lQ_kyPT7ekUAUYFdatYSwCjZpwhZx7eBE0ENg6X8b8Pi_HKbbZSN7MQJpSm0rRwR_t3bcNrSLXpUf0j2Y7KJ9aQ629sOGPyu-axkhF3lp_PwxJ6Jq9_I_6Q3ri5Serf"
    name = "login_success_illustration.png"
  },
  @{
    url = "https://lh3.googleusercontent.com/aida/AP1WRLtOhExekaDGuOHaDdP5_GjMklfARCuGrQZ-9Pg3cinp_gHdNr29bE3DsuREaYv0aPDejwLWlMXiqbgyOxms7AdY8Fd6W5iiBDEG6QtSHS1lEqdC6pNNK6z3vwC28K9u5YdkBxxWLxJcDyd4lfzgwMTNvS2xSJMYhc0Qupb-at6JqO317jIXI4Z-1Fgol2RrSyieMeihWr-mFQY-uJ3TQtTS2PxMmwLsK7HT3XFpsFOeJlsNY7CasCj37To"
    name = "report_found_success.png"
  },
  @{
    url = "https://lh3.googleusercontent.com/aida/AP1WRLv2X8SV2AnEMlKyNDJBdVm2Z-EJbvRjdUQ6HO1hQCp2Es9wWTo9to4YiMfG-js9QA4sl0U8nSQInuMxvMv8smg8aIZ0Z2KjHHIq8TA8WzKgyC-kDLcGcwhMK8hwpwUZ85oI2tSPQXzzz5og034zl5rqovVZJ4qCt0Thvi0uSCSKuAoVOrcvk9oUccn8KysDZXXktPi6U3cpYdtekLwa3RiNe2r8uq9c4JnEkRmDwYE8QsJe8bSzb_5lxcw"
    name = "report_lost_success.png"
  },
  @{
    url = "https://lh3.googleusercontent.com/aida-public/AB6AXuCEAa66kom0qlxBt5goiz6Zwzvxgcx-A5LoSns4xe_GR8In4XZ_Xc0Hzp6QWsZ_65wJr4_Vw6KZt0R3PYz54-4ikn5fYVvCLanUv3sIk0uYDxcS4n4VkFGubCyh7-qdpp1etH1nalINWZ0lYPnKdbJl6ZZQgMhdzndbzz-wA38cHRfsXlbxhaFLvm35yCwBj4bkaOD_kOGrVNI6aCdimINQCU4c6xV12hD4dX2h_1RlmlDsyqi6kOGGt2Cr3GRX-Wb1JYZb8TWnQ9I"
    name = "suggest_owner_illustration.png"
  },
  @{
    url = "https://lh3.googleusercontent.com/aida-public/AB6AXuB5MMnl8eoP7RYUu-aSzuJoTeCUkPt8i4wWl-pI4vhU5_HvtTS36jgBeaAedfKpw0YF7UH6rRWFSpwOMj7Hv47Utet3h7Pp3HST3MtWNehxCvLzCArdAG4gx-q98tNhbxr_3SdEQrFMl8UqEo-Mkiqi-hiGHJmalpao6niYQWKOHYjgeV6PRHlZCXTfM5m3uZTKpfnGJKbNykMCQzy14TSLNInVg24WKgF8nnkD8Lfx-2UD2Qkx9rmSj-6GlzGC6p2uUQkc6MZlyOA"
    name = "help_support_illustration.png"
  }
)

foreach ($item in $images) {
    Write-Host "Downloading $($item.name)..."
    Invoke-WebRequest -Uri $item.url -OutFile "public\images\$($item.name)"
}
