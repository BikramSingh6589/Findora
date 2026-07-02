$urls = @(
  @{
    html = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NTk3NDBiNDZjOTMwMWE2MTFkY2QzMmVlM2Q5EgsSBxCz2KW8kxgYAZIBIwoKcHJvamVjdF9pZBIVQhM2MzU3NDQ3NTg3NzkwODgxNTc1&filename=&opi=89354086"
    png = "https://lh3.googleusercontent.com/aida/AP1WRLtKhNkTd-Y8Ocnm949h0eENWaT-MrQ0Jnp97L-V_ORsmes6ZbnrpTLhtDZchwKhlDAaE7zd8Rce5o4EAv0nFErVQ0KH-ARIGtmAT0TdqimRSJDIR1qEloIHU6YcDE27eUxpfWe9PrB0j8UWbJ2Mw895TWziotPTl9C4t5R1QXjwNY2X5LueOWdP90_xzBbxoXtbtHKz1bAyvWVKm8bJCmc9xFROHswVRtLRVFsqj_l4Bsi-VaVQPuhfrA"
    name = "student_dashboard_desktop"
  },
  @{
    html = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NTk3MzljOWRmYWQwMWE2MzE3MDhkMzljMjk0EgsSBxCz2KW8kxgYAZIBIwoKcHJvamVjdF9pZBIVQhM2MzU3NDQ3NTg3NzkwODgxNTc1&filename=&opi=89354086"
    png = "https://lh3.googleusercontent.com/aida/AP1WRLsMui6QdTGK7foezpQNc_RTWyOWp-EQSZ9yuwMnpllukFP7cuN3VW5QXQ8aQ3unXDJk8xohRLy3Cl_8EPn3u5uu1XTMxjiPVhtBqA8OooaUgGlJLWqCLOre6KIi3yZDCjdD_dsRd4KuzV6-MGqDOPy8AIrP_HzgjAjdxioSlXtoM0jjJ1rn5G31-I2kIAbh6FBGFSLYSkWdE5v7NDuZMVcA5S2owwN6qDDwMkvrnUS-N0SmglAHIDb4ZA0"
    name = "student_dashboard_mobile"
  }
)

foreach ($item in $urls) {
    Write-Host "Downloading $($item.name)..."
    Invoke-WebRequest -Uri $item.html -OutFile "stitch_screens\$($item.name).html"
    Invoke-WebRequest -Uri $item.png -OutFile "stitch_screens\$($item.name).png"
}
