def exclude_admin_endpoints(endpoints):
    return [
        endpoint
        for endpoint in endpoints
        if "/admin/" not in endpoint[0]
    ]
