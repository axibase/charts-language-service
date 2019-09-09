import { deepStrictEqual } from "assert";
import { Formatter, FORMATTING_OPTIONS } from "../formatter";

suite("Formatting indents tests: sections and settings", () => {
  test("Correct [configuration] section", () => {
    const text = `[configuration]
  width-units = 200
  height-units = 200

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect [configuration] section", () => {
    const text = `[configuration]
  width-units = 200
    height-units = 200

`;
    const expected = `[configuration]
  width-units = 200
  height-units = 200

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Correct nested [widget] section", () => {
    const text = `[configuration]
  width-units = 200
  height-units = 200

  [widget]
    type = chart

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect nested [widget] section", () => {
    const text = `[configuration]
  width-units = 200
  height-units = 200

  [widget]
  type = chart

`;
    const expected = `[configuration]
  width-units = 200
  height-units = 200

  [widget]
    type = chart

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Correct nested [series] section", () => {
    const text = `[configuration]
  width-units = 200
  height-units = 200

  [widget]
    type = chart

    [series]
      entity = server

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect nested [series] section", () => {
    const text = `[configuration]
  width-units = 200
  height-units = 200

  [widget]
    type = chart

    [series]
        entity = server

`;
    const expected = `[configuration]
  width-units = 200
  height-units = 200

  [widget]
    type = chart

    [series]
      entity = server

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Correct for loop", () => {
    const text = `[configuration]
  width-units = 200
  height-units = 200

  [widget]
    type = chart

    for server in servers
      [series]
        entity = @{server}
    endfor

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect for loop", () => {
    const text = `[configuration]
  width-units = 200
  height-units = 200

  [widget]
    type = chart
    for server in servers

      [series]
      entity = @{server}
    endfor

`;
    const expected = `[configuration]
  width-units = 200
  height-units = 200

  [widget]
    type = chart

    for server in servers
      [series]
        entity = @{server}
    endfor

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect nested if in for", () => {
    const text = `
  [widget]
    type = chart
    list servers = vps,
      vds
    endlist
    for item in servers

    [series]
      entity = @{item}
      if @{item} = vps
        metric = cpu_busy
      elseif @{item} = vds
        metric = cpu_user
      else
        metric = cpu_system
      endif
    endfor

`;
    const expected = `  [widget]
    type = chart

    list servers = vps,
      vds
    endlist

    for item in servers
      [series]
        entity = @{item}

        if @{item} = vps
          metric = cpu_busy
        elseif @{item} = vds
          metric = cpu_user
        else
          metric = cpu_system
        endif
    endfor

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect formatting in the first for, correct in second", () => {
    const text = `  [widget]
    type = chart
    metric = cpu_busy
    list servers = nurswgvml006,
      nurswgvml007
    endlist
    for server in servers
      [series]
    entity = @{server}

      [series]
      entity = @{server}
    endfor
    for server in servers

      [series]
        entity = @{server}
        if server == 'nurswgvml007'
          color = red
        elseif server == 'nurswgvml006'
          color = yellow
        endif
    endfor

`;
    const expected = `  [widget]
    type = chart
    metric = cpu_busy

    list servers = nurswgvml006,
      nurswgvml007
    endlist

    for server in servers
      [series]
        entity = @{server}

      [series]
        entity = @{server}
    endfor

    for server in servers
      [series]
        entity = @{server}

        if server == 'nurswgvml007'
          color = red
        elseif server == 'nurswgvml006'
          color = yellow
        endif
    endfor

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("A couple of correct groups", () => {
    const text = `[group]

  [widget]
    type = chart

    [series]
      entity = vps
      metric = cpu_busy

  [widget]
    type = chart

    [series]
      entity = vds
      metric = cpu_busy

[group]

  [widget]
    type = chart

    [series]
      entity = vps
      metric = cpu_busy

  [widget]
    type = chart

    [series]
      entity = vds
      metric = cpu_busy

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Correct for after var declaration", () => {
    const text = `  [widget]
    type = chart
    var servers = [ 'vps', 'vds' ]

    for item in servers
      [series]
        entity = @{item}
        metric = cpu_busy
    endfor

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Adds a space between setting name and equals sign", () => {
    const text = `[configuration]
  entity= cpu_busy

`;
    const expected = `[configuration]
  entity = cpu_busy

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Align series setting declared after [tags] and empty line", () => {
    const text = `[series]
      entity = server
      metric = cpu_busy

      [tags]
        startime = 2018

starttime = 2018

`;
    const expected = `    [series]
      entity = server
      metric = cpu_busy

      [tags]
        startime = 2018

      starttime = 2018

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Removes an extra space between setting name and equals sign", () => {
    const text = `[configuration]
  entity  = cpu_busy

`;
    const expected = `[configuration]
  entity = cpu_busy

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Adds a space between list name and equals sign", () => {
    const text = `[configuration]
  list entities= entity1, entity2

`;
    const expected = `[configuration]
  list entities = entity1, entity2

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Removes an extra space between list name and equals sign", () => {
    const text = `[configuration]
  list entities  = entity1, entity2

`;
    const expected = `[configuration]
  list entities = entity1, entity2

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  // TODO: will be affected when inline-scripts formatting PR is merged
  test("Does not affect equals signs in setting value", () => {
    const text = `[configuration]
  script = var hello= value()

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect [column] after endfor", () => {
    const text = `[configuration]
  entity = a

[group]

  [widget]
    type = chart

    [column]
      key = value
      label = Count
      list metrics = a, b
      for metric in metrics

        [series]
          metric = @{metric}
      endfor

        [column]
      key = value
      label = Value

`;
    const expected = `[configuration]
  entity = a

[group]

  [widget]
    type = chart

    [column]
      key = value
      label = Count
      list metrics = a, b

      for metric in metrics
        [series]
          metric = @{metric}
      endfor

    [column]
      key = value
      label = Value

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("No ident increase after one-line script", () => {
    const text = `script = if (dialog) widget.hideEmptySeries(false)
column-time = null

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("[series] at the same indent as [tags] in [widget]", () => {
    const text = `[widget]
    type = chart

    [tags]
      host = *

  [series]

`;
    const expected = `  [widget]
    type = chart

    [tags]
      host = *

    [series]

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("[column] at the same indent as [tags] in [widget]", () => {
    const text = `[configuration]

[group]

  [widget]
    type = console

    [tags]
      "type" = logger

[column]
      key = level

`;
    const expected = `[configuration]

[group]

  [widget]
    type = console

    [tags]
      "type" = logger

    [column]
      key = level

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("[dropdown] nested to [widget]", () => {
    const text = `[configuration]

[group]

  [widget]
    entity = e
    type = chart

    [dropdown]
      change-field = metric
      options = javascript: requestEntitiesMetricsOptions('name', 'label')

    [series]

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("[series] at the same indent as [column] and [tags]", () => {
    const text = `[configuration]
  entity = a

[group]

  [widget]
    type = bar

    [column]
      label-format = tags.instance

    [tags]
      instance = *

    [series]
      metric = collectd.df.df_complex.reserved
      color = brown

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("[series] at the same indent as [column] and [tags] (empty line after tags)", () => {
    const text = `[configuration]
  entity = a

[group]

  [widget]
    type = bar

    [column]
      label-format = tags.instance

    [tags]
      instance = *

    [series]
      metric = collectd.df.df_complex.reserved
      color = brown

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("[widget] after [column] and [series]", () => {
    const text = `[configuration]
  entity = a

[group]

  [widget]
    type = bar

    [column]
      column-label-format = tags.instance

    [series]
      metric = collectd.cpu.cpu.wait
      metric-label = wait

  [widget]
    type = chart

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("[column] > [series] > [tags] inside if and for", () => {
    const text = `[group]

  [widget]
    type = bar
    var sites = getTags("iis.errors", "site", "\${entity}")

    for site in sites

      if site ! = "DefaultWebSite"
        [column]
          label = @{site}

        [series]
          metric = iis.errors

          [tags]
            "type" = locked
            site = @{site}

        [series]
          metric = iis.errors

          [tags]
            "type" = notfound
            site = @{site}
      endif

    endfor

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Two [option] at the same indent", () => {
    const text = `    [dropdown]
      change-field = series.metric

      [option]
        text = CPU Busy
        value = cpu_busy

      [option]
        text = CPU Idle
        value = cpu_idle

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Child inside keywords, parent - outside", () => {
    const text = `    [column]
      key = value
      label = Disk Busy, %
      var f_systems = getTags("nmon.disk_%busy", "id", "\${entity}", "now - 2 * day")

      for id in f_systems

        if id != 'total'
          [series]
            label = @{id}

            [tags]
              name = id
              value = @{id}
        endif

      endfor

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });
});

suite("Formatting indents tests: !=, ==, =", () => {
  test("Correct !=", () => {
    const text = `if id != 'a'

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Correct ==", () => {
    const text = `if id == 'a'

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Correct =", () => {
    const text = `type = bar

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect ==", () => {
    const text = `if id =='a'`;
    const expected = `if id == 'a'

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect =, no space", () => {
    const text = `type=bar`;
    const expected = `type = bar

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect =, extra space after", () => {
    const text = `type =  bar`;
    const expected = `type = bar

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });
});

suite("Formatting indents tests: >=, <=, >, <", () => {
  test("Correct >", () => {
    const text = `if a > b

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Correct <", () => {
    const text = `if a < b

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Correct >=", () => {
    const text = `if a >= b

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });
});
