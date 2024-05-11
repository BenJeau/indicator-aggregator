const backgrounds = [
  "/bgs/pavel-neznanov-EamEwfBKDNk-unsplash.jpg",
  "/bgs/photo-1545987796-b199d6abb1b4.jpg",
  "/bgs/nasa-Q1p7bh3SHj8-unsplash.jpg",
  "/bgs/mathew-schwartz-sb7RUrRMaC4-unsplash.jpg",
  "/bgs/mathew-schwartz-5RHbXOXNd5w-unsplash.jpg",
  "/bgs/frankie-lopez-NBiiX7aP0Yw-unsplash.jpg",
  "/bgs/alistair-macrobert-SCtlFdgTw1A-unsplash.jpg",
  "/bgs/tobias-fischer-PkbZahEG2Ng-unsplash.jpg",
] as const;

const lowResBackgrounds: {
  [key in (typeof backgrounds)[number]]: string;
} = {
  "/bgs/pavel-neznanov-EamEwfBKDNk-unsplash.jpg":
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAAbACgDASIAAhEBAxEB/8QAGwAAAgIDAQAAAAAAAAAAAAAABAUABgIDBwj/xAAnEAACAgEEAgIBBQEAAAAAAAABAgMEEQAFEiEGMSJBEwcUMlFhQv/EABkBAAIDAQAAAAAAAAAAAAAAAAEEAgMFBv/EACIRAQACAAUEAwAAAAAAAAAAAAEAAgMREiExBBMjUUGxwf/aAAwDAQACEQMRAD8A8urLG6XGvxy5rvGHeTK2AobOXC/EgcTyK9MChOrj4v8AqHS2TcktblbkMbUyjSooV2fmwOU/snI6+xoOvcpiSrtu0zLDJI8sEytAXE+Dkf77zjPrjo0+JHf9pt0qmzfi3i3OskUNkABZQM/iz/y2AxC/2udYw5YdalX1OjxK9wc2dDuedyVL20769YBXVWimYlVlDABlIH3j3jvs/wCaRbles+U2932LdakcdWRVaStCgxZT0GjAOQfiBy9nCn60hsvd2819n3hxRt0VYNEqF3kdusgkfHrrPZ661tsS24dynEdR/wAkcYXm8arxJ+LfYGR7+8DSmN0/mbZbvzB0z26tF2lf3Kw+zSJtV0Wpo60jCKwYgrqwOFXOMAnpWAPsE5wRqaD8n3W2NoWjao2q9hJHjfnGTDJHKEZnCA55KVZx9jl9amr61Kcn3+R2thqaXaCJtnlbBGs70kf7YlyvDifkG9lce+ORnGTyHvRHjvk9yk5q1La1C88cogZwQApDCTsEsxwMMOyDghSe1vh0kj7Pu9hpZOdNpxDhyAmAzjodHDdjPo+tOdipVbm12RbgWYPXqOyyfIEujM3R6wWGces6fbtVIkA8RxuXklxrEcVv8Fm/UDJHPIBKphaQ/wAR1yb7OfQHWMay3zdYx4/DJa2aG0LT/uHjaV2eZBgMxYdK5K9qezxGFx3rnbAx2IkRmUGEtgMeiUkzj+tXm6TX2bZpov5W34TcvkGBBOMHodgHr7GdC9dQMjV5incdxbbWgvUrBpJLGzq1uAy/iUk5Q5+Xy48OgDxBB/lqaTbg72fGpGsSPKWmkZi7FiSq4ByfvB96mo6W3DlLcwB9z//Z",
  "/bgs/photo-1545987796-b199d6abb1b4.jpg":
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAAbACgDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAgDBQcJBv/EAC0QAAEDAwMDAwMEAwAAAAAAAAECAwQFBhEAByESEzEIIkEjUWEUFTKxcYGh/8QAGQEBAAIDAAAAAAAAAAAAAAAAAgEDAAQF/8QAHREAAgIBBQAAAAAAAAAAAAAAAAECERIhMTJCUf/aAAwDAQACEQMRAD8AXL0pbWbcVysN1DcBuQvpdDSWAglDqVHBbWRjpJByOc8H408G1O3e3FLrpYXazCv3SCIL7RSVJlw47v0c9SlK9uEnzzgHgcaUf04V+iXFLWwxbE2jtvSnXDh915p4BeGgnrzhQQkdRJHUSMAJ503tlVy3qrU2YVFnx502lOmHNQl3LzDykhztnB8ltfVjB+c+Ma3lxOf2NPi7UbVQKo5KXb0AoV4i9IUlPHwgeNFT25sI3DTK9T7Ohwn6dKRKStTaUJS4M4UQT858H8HVsxHWWu2vuxyB/B1KkDHzkDA15K4Lkuam7sUKy6XbcCXSpdNNTqM5xfbdjNhx1tJSlQIX70tceQFknwNHIsUV4SVOQhC3Q0lSmycYZSMhWc5PPPj5++jVlKgKLx77jojqUUjBGDjxkAAcceM8aNKzKM2tPbRNoMGBAjMfpHfprQ8hWVEEe8gZHyD9/wAnnGgWtt3QaLIkzINNhJdkOFx1xuM2gOhQAJAAwc4GSeSAORgalphJhQCSSe0Bn/C+P61eMOLaek9s9OGUugDwFFKiSPtykHRZEassoxW2pLPdKWAQCF5Wj/eeQPx/065wX16ob63ombq1Laabe1FqttuwU2+mhJD7blNafcZkdxQaLiFOqUHwgHyCAo4IPSSQkJaUEjHQfbj49oP96WnZvaywtvL+uubZdATSnKtIKJgZkPFt1PWpYHQpZSAFKJAAGM8Y0KcizLHQTW/d0vVftyxZW993XLNDl1Rm2KhTZeUR5Tkdag20/C9oQ4plKVqUhKOVgghR5NMX6/LPt2o7TC4JlPK6jQ3e9T5AfcSphaykKI6VDOQB5zjHGjRacXuSnZ//2Q==",
  "/bgs/nasa-Q1p7bh3SHj8-unsplash.jpg":
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAAbACgDASIAAhEBAxEB/8QAHAAAAgICAwAAAAAAAAAAAAAAAAcFBgIEAwgJ/8QALRAAAgIBAgQEBQUBAAAAAAAAAQMCBBEABQYSITETMkFxBxQiUWEjM4GSsdH/xAAVAQEBAAAAAAAAAAAAAAAAAAADAv/EAB8RAQADAAEFAQEAAAAAAAAAAAEAAhEhAwQToeFBUf/aAAwDAQACEQMRAD8A8rNGrRt3A1l5XLcrtenBgBAlLMsH8D/umDsHw24CVWbc3LfFMkkiMUOnJTHEnGYRET0HqZGP4zpjt7prxCeqDhEuIyl5YyPsNZhDz2TP+uuwS9u4CpR8KlUpvsCYWFqUZSOQST9Q7jGO/fWi23sHz0ExQhaz5gyMYxHTqSYxyMY+2mO0M1t6+yPM7ge4iilw7qkP40aaG7u28Ya9KsMJx+mDzD7j27e+jUPbg8Pr7LOp/Zr0Nxpr8Oe3KCXrh4Tm2J+LJhIPNMAgiGe3QZGM59dSu4fErancH0+GKXCG1Lt17PzDt6JZK1aiR+1MGZgIAkkcoGeudLrZ7Dl2AyDCJdOvucf5rNDW3r0mW2SbKQkSZHqSAdLWtXN5kWXnOJbBxdYbYhbVR29Ri6TvDXXhFeSR9IiR5RjykkAZ+51IK4+nCs5Fza6TK9mzK2FxXGIiyQ5ZCPKOYQIJHIJAdiMY1TbiVKr5XAAhzIA+uBjA1w1oxlEmQyeXSXKWMSRTyVdLSd3XfRfvPt06O3UUtZzrTFJlCAHoDLmnj3OT6k6NU9zWcxjznBPUaNDp+RQXnZ//2Q==",
  "/bgs/mathew-schwartz-sb7RUrRMaC4-unsplash.jpg":
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAAbACgDASIAAhEBAxEB/8QAGQAAAwEBAQAAAAAAAAAAAAAABgcIAAIF/8QANBAAAgECBAIHBgYDAAAAAAAAAQIDBAUABhESITEHExRBUWFxCCIyQoGRFVJiY4KhssHx/8QAGAEBAAMBAAAAAAAAAAAAAAAAAwACBAX/xAAeEQACAgIDAQEAAAAAAAAAAAABAgARAxITITEEMv/aAAwDAQACEQMRAD8A5gZJo+yZgoGp3YbS5Q7T6ju+mBq/ZarKB0rbeOugjJaGRfeCg81JHyn+jxxZ1hyBT3/SOqo4p4eW2aNXB+41wUw+zZ0bpIJZYJLNWSDUJR1TDrfWBw6sP44NcCVY8k5WvsSC8tW6dayGuKlIVlEcitzTf8IP8gR9R44KroyU9qhpw2+SYmZ1XmzMdfsARij+m72d7BZcoT3qz3Kls8qe409aVgikQ/KycSfQDXXlocTv0a5cgukNzl/Haa89kquzdop45VQEKDtHWgMdNeemDX5yoIHkvvfcC66hqpxqYz5DkBjYbFdkl5Ttp+pYnXRTKqnkT3keGNg+FpOSVN0Z5FzzdqNa7OmcYrfTajdbctqYYx+mStkBmkPlEI8NuJMr5KtLT0tNBRw97cTJM3izklnPmxJwPvUzHM5tYfbSQVAhjhQBURPAAYUPtG327xZjjtkVfKlLHAm2JToBu26/5H+vAY6JW16hD9az1s35jtuc8xG2XWVTEaCWaAMeCMx2I2nkNx/5iPMrXd+j+4yWZhHHT1dTIELnai1Kttlhc/LqRuVu7dx4Hgxcx3S4RdJMkUdU6oKIKAO4B5NBhJdKEjtecxxFjt3w1On7pVNW9TuP3xgcMmQ0ZqVRrRjdrMxUlyVng3JJEdssTjR4m8GH+xwPdjYTluudfJlC13l6pzWx1i0gn194w6fA35h4a66d2Niy5NxtDOMg0J//2Q==",
  "/bgs/mathew-schwartz-5RHbXOXNd5w-unsplash.jpg":
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAAbACgDASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAcEBggF/8QALxAAAgIBAgQFAwIHAAAAAAAAAQIDBBEABQYSIUETMTJRYQcUIiNxUmOBkaGx0f/EABkBAAIDAQAAAAAAAAAAAAAAAAQGAQUHAv/EACkRAAIBAgUDAgcAAAAAAAAAAAECAwQRAAUhMUESUWEisQYTI0JxkeH/2gAMAwEAAhEDEQA/AMRGgJY+QpkHXNIajIVYkqMrn3X2/p5/313Ntm3GQANTrnPf7pf+auOwfTo8VssNZKkkznqsNnxT+2EU4OnCWd6dS0R1xoGR5lSon12tbC4jr85AdXYuc8qjyU9ep1H3GSooxytGQPxDDz+dMzftrm4TtLtTbbWeOrGa87shbnOSekpGFKhhnHcddLXiyNhPYWpXDLERzPEwlxny/JSRpDXMZaido5U3BIa97/m23705A1tcZf8AGNNmMklJFGVK7X5/vjjFcsTyHOSVX/OjUK5K8R5bCshIzh1I/wB6NFJNVIOlW0wLU1UXzPVhicLbcd3uGKnTa2YE8Waa5LzRwJ/HITiNF/cdewOtCcNb/U4epVtl2+6zW7yo33TR+GVg8y6xnrHGR6QQGf1EAYBUG0V4YuJOHuE44wu0S12uy1B6JpwjEPJ3fBA6MSNQtj3XcbclvcbNyWWzMwMkrNlmzrRs7ypMuiMDnqYkqe2gUmw7eq1zqew2KDQ5isMT9CXc2sx+3U6jzt5HB4OmOJbvBTbO+3RVo5ceBKoYgEloslSe2R398HtrL31L4W2uC4buw2SkVgGSCRcqHXrkED0sDkMOxB12ty3K+8toNakI5a48/wCVqo7hZsTVtzillZkTwZ1BPpkdG5mHtnlBPz17nSDFRLCwKne98c0zNCQ6nXFNu8XcSRsa+42BcVQFxZQOcAYHUYJGPk6NQt5/URWfqWQsT8++jUy0ULOWZbk4txndYgAEh9/fH//Z",
  "/bgs/frankie-lopez-NBiiX7aP0Yw-unsplash.jpg":
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAAbACgDASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAABwgABgkF/8QAMBAAAQMDAwMCAwgDAAAAAAAAAQIDBAUGEQAHIQgSMRNBIlFhFBUXJEJScbEyU6H/xAAXAQADAQAAAAAAAAAAAAAAAAADBAUG/8QAJhEAAQIFAwQDAQAAAAAAAAAAAgEDAAQREiExYfBBUYGRBSJxof/aAAwDAQACEQMRAD8Azy2m2bqe5W6lK2vlqcos2o+pgTsRlZS2pQALuBlWOO7GTxnnV86n+ke5enmo0VwVOLW6bcCEJiuQm3CpMj00qWyRyFEEkfCo8hXGMEm2/umW7t6r4g3ZsjZbrtpOPNem4KauC7GQ2odwUl1KVqKlpUvwfcjg8uzTtjYY3tr25NVttFRXIiMs0mZVZK1xYCAkpdZZYAPplSkIWVDHd4+eoT3yStmJCWKZTmmv8imzJ31Ek88WkIn0g9AFd3XgOXre1GeRGDwYhQ5YUxG78Alb6h8bmARhpsc/qI8abi5+grYmx6ZIrN/1F919tAUER4QUI4HOGWMhlsY47nVL/gave7e/VtbSWtU6LL3Tp1Iq7rjshiDTnkxXGGVf4ABXarnBweM6RTc/qes+76sqoVOkVm4mmk9kYOVBCEpwT8ZIUtSs8e4PnznhyQmG3nlcISJe+KJsPTyud4HMyzqN2CSCnbNV/evrG0dTeLcrZ+xG6rQdtrJtxLiGy2xUpqV1SY6rHkNNhMdnz5JPbjU0A7l3xt2XTvsX4YQX5BADj8ydNWF8/wCtLyUgY4xzqaccaYu+ja052KFxdfpQ3M82hn9veoOZFgtIXXa60pZC1EVFYUsjjJP9fLwNG+hb9xpjKE1MzJ0dR7iVVBwPNq/cheeD9DlJ9x76zwgy5LIQGnlJAAxg6uVErtXQkBNQdAAz51k3ZNNRWNA1MdCSNCXqoL8p7qaWxb1z0wIy8zUUobks8eHULBHj9QPaf+aBl97Dbd3Ch6Q1tPa7zpyT93SInd9cemsK0F6Tel1UGY1VaPXZcOWzgodaX2qHzB+YPuDwdX/qKjx5tlQbuejMiryHGUvSmm0tqcCkZPcEgAn6kZ0vc424I3awRbFFVpAUv7ZFqgOOCk2bc9L7efy0l9SMfwr1E6mh1PrFWjuBUeqS2if2PKT/AEdTVkEeQclX3Ew1brgaR//Z",
  "/bgs/alistair-macrobert-SCtlFdgTw1A-unsplash.jpg":
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAAbACgDASIAAhEBAxEB/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAYHCAkF/8QALhAAAQMDBAEDAwIHAAAAAAAAAQIDBAUGEQAHEiExCBNBFFFxI2EVIjJSgaHR/8QAGAEAAwEBAAAAAAAAAAAAAAAAAwQGAAH/xAAmEQABBAECBgIDAAAAAAAAAAABAgMEEQAhQQUSMVFx8BOxYcHh/9oADAMBAAIRAxEAPwDnQDnTIvbe80poyjQ3Um4IaqhSwpaB9WwlSkqW2ScHCkKBGc5HjTjtxtFaF5W5c0yqbhppNeoy2xTKcphC0VAnBV3zC8Dsfyg9407xfSlf1wvqlQ6pSRT3nVuNKdnsNIQCsniA86k/60y/PYj2Fmj4J+sTYgSJJBbGnkD7ORm4dsdwrTpLVeuOzatApj5wia7GUGAr+1SwMIP7KwftpYLZ/qA6PzrqV6d/p9qoQty99xrUVTUs+xJgzKnGeZdbyc/p81pUO/tjU43q9Ofpn3TuOQrZ+r0m360pt1ZZt4PTITr4TyTyiJbUEAnolopABB4nwetTWlo+QnTvr+9czkF5DhbA1936ZgFcGRHJMppbJGMhaSk9jI6Pff8AzRqu3zsxcNnxm4l2VGJHqSozEd5lb7i3i8F5xhaRghHHvl4wAOtGjpkNkWMAqO4k0c9GhbRbu3QGw3Vq/IaeVxAZdcaGeOewoggfvxwe8ac6N6Xa7UJbDUy72o7h5FSRLVLfSlPZIQlQHQ+M+etXmy0m4bZRMq7rr7sie5GWQ4pADQQDwSEkBAz54gZ+c6Yt0mWNvduqlOs2O1S5KYa3/eabSpZWE9FSlAlX4ORqMRxxya64w0K5TWo3ur9/mVKuHNRAFKs3+ci9O2O2P2u9qr7kzp9QnuKC2Ib8kOuyAPKQygpSkZxkqKgO9MdS3aq0j+GULb6PGtWjNvpUuLAbT+sMjHulPHngf4yfGslGtVeuy0Vus1KRNnzMLfkPOFS1n8n4+wHQ+NULbioTXKo2hyS4pIHQJzjBHjVWxACU8zyuZXc9B4G2Tr0+l02mh71O+UP1mXJU61uHWKSmoGoJjxILjCHjzISWU5Cc95znsY840ajm4FQnSdypjkiU66tUZaSpaskgJOB3+Bo00hoIFYB14uKs5//Z",
  "/bgs/tobias-fischer-PkbZahEG2Ng-unsplash.jpg":
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAAeACgDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAUDBAYBAv/EACsQAAEEAgEDAwQBBQAAAAAAAAECAwQFBhESAAchEyIxFSMyQXEUUVKBkf/EABkBAAIDAQAAAAAAAAAAAAAAAAECAAMEBf/EACIRAAEDAwMFAAAAAAAAAAAAAAEAAhESITEDEyJBcaGx8P/aAAwDAQACEQMRAD8AR5N28y+pjGc3lEl2W3xZUkTPTkclL2kJOyVJGjtX46J2etHRYdJiSEuze7Ed9tKQiShh6RLKOaVDSUKSC6dE/hvXEKPjR6lmVFPOwputv7Orr1Sihcmd9QclT3ykjSQhjyhGkpAQriND58ndavoKWmlWN1AhrsbCvP1CTFdJYkR23eLaH1NIUCkOD4SF74JKj7db5G0yKYC0UiJIVa07W40iSbOP3LZEFuapliU9XOtlUkedpaAK/jieX69o6ZVOHpVFnoxrO6a6lzWHC40lpwfaC/uOH1EBPj2p3y3rQG+n+UUFTb3gsVuYlGx6uaVKSqOh9h5p7Q0tsPEk7IT7hokedeOlCKibiuHyWqSCmmpJLKkOzUKiSYyG1nRK3AdtbGvbyHuPk/vpqREfe0NppmAorTtzPyKcbGNnuGsuqYZbcBn+lxIB2tQW2ADoAH+P2OjrPo7V10Wph38G3kIp48pbzb6nVASU80hXJLK18mydDQUfHLX76OldQTkeUWaTQIgqehw5zt9kLt3hudPrp/smEyuvZWprWk79dSVKUlROylAB+AT411WtbVeQZWzFv7K0kOOyeU1RkcFkfhzUpQP4/wCJBJA0B+w47YdwbPF23aQtNzIjrKmYwkD1FwlKIJWyo+U7I8/9HkdbDsFgGMZHlc60yRhyxFegyPRX7UOq5Dx8+1I34T538k7+dHJucINh4AGVFeyanFsatrWjwCfYodr2WKp159xC5BTxQpxSnvUbQdcilQSnegD876r1dRhWV2NXXYv6K7a8hrmitXDVFeYQg6cbeV9yMXB8hHP3DyN9O+5nfO7te6DPb8L+nU8UJjhuPEZc4jZSlWlABfkfirxoDrt72NlYTjFxn8DPZn9RCbKXWY8NMdKxoDaSlZ4q2QSdH9/HSgDrYp75F+68dycBmRqLF8ByFpP01ClyYDEWM5XrguLHu2tlQTyPNXj+f56Osg13ey/Jauqg200uxm5K5CEk7JLY4I5f3OlH/fR1GMLRBMqp2oJsv//Z",
};

export const getRandomBackground = () => {
  const filename = backgrounds[Math.floor(Math.random() * backgrounds.length)];

  return {
    small: lowResBackgrounds[filename],
    big: filename,
  };
};
